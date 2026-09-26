import math
import re
from collections import Counter


# --------------------------------------------------
# TEXT PROCESSING
# --------------------------------------------------

def tokenize(text):
    """
    Convert text into simple lowercase words.
    """

    words = re.findall(
        r"[a-z0-9]+",
        (text or "").lower()
    )

    return [
        word
        for word in words
        if len(word) > 2
    ]


def build_content_text(item):
    """
    Build searchable text from a media item.
    """

    title = item.get("title") or ""
    description = item.get("description") or ""
    genre = item.get("genre") or ""

    return f"{title} {genre} {description}"


# --------------------------------------------------
# GENRE SIMILARITY
# --------------------------------------------------

def get_genres(item):
    """
    Return genres as a set.
    """

    genre_text = item.get("genre") or ""

    return {
        genre.strip().lower()
        for genre in genre_text.split(",")
        if genre.strip()
    }


def calculate_genre_similarity(item_a, item_b):
    """
    Calculate Jaccard similarity between two genre sets.
    """

    genres_a = get_genres(item_a)
    genres_b = get_genres(item_b)

    if not genres_a or not genres_b:
        return 0.0

    intersection = genres_a & genres_b
    union = genres_a | genres_b

    return round(
        len(intersection) / len(union),
        3
    )


# --------------------------------------------------
# TF-IDF
# --------------------------------------------------

def build_tfidf_vectors(documents):
    """
    Build simple TF-IDF vectors without external libraries.
    """

    tokenized_documents = [
        tokenize(document)
        for document in documents
    ]

    document_frequency = Counter()

    for tokens in tokenized_documents:

        for word in set(tokens):
            document_frequency[word] += 1

    total_documents = len(tokenized_documents)

    vectors = []

    for tokens in tokenized_documents:

        term_frequency = Counter(tokens)

        total_words = len(tokens)

        if total_words == 0:
            vectors.append({})
            continue

        vector = {}

        for word, count in term_frequency.items():

            tf = count / total_words

            idf = math.log(
                (1 + total_documents)
                / (1 + document_frequency[word])
            ) + 1

            vector[word] = tf * idf

        # Normalize vector
        magnitude = math.sqrt(
            sum(value * value for value in vector.values())
        )

        if magnitude > 0:

            vector = {
                word: value / magnitude
                for word, value in vector.items()
            }

        vectors.append(vector)

    return vectors


def calculate_cosine_similarity(vector_a, vector_b):
    """
    Calculate cosine similarity between two TF-IDF vectors.
    """

    if not vector_a or not vector_b:
        return 0.0

    # Iterate over smaller vector
    if len(vector_a) > len(vector_b):
        vector_a, vector_b = vector_b, vector_a

    similarity = sum(
        value * vector_b.get(word, 0.0)
        for word, value in vector_a.items()
    )

    return round(
        max(0.0, min(similarity, 1.0)),
        3
    )


# --------------------------------------------------
# RATING SIMILARITY
# --------------------------------------------------

def calculate_rating_similarity(item_a, item_b):
    """
    Compare the ratings of two media items.
    """

    rating_a = item_a.get("rating")
    rating_b = item_b.get("rating")

    if rating_a is None or rating_b is None:
        return 0.5

    difference = abs(
        float(rating_a) - float(rating_b)
    )

    score = max(
        0.0,
        1.0 - (difference / 5.0)
    )

    return round(score, 3)


# --------------------------------------------------
# MEDIA TYPE SIMILARITY
# --------------------------------------------------

def calculate_media_type_similarity(item_a, item_b):
    """
    Compare movie/series type.
    """

    type_a = item_a.get("media_type")
    type_b = item_b.get("media_type")

    if not type_a or not type_b:
        return 0.5

    if type_a.lower() == type_b.lower():
        return 1.0

    return 0.0


# --------------------------------------------------
# ITEM SIMILARITY
# --------------------------------------------------

def calculate_item_similarity(
    watched_item,
    candidate_item,
    content_similarity
):
    """
    Calculate similarity between one watched item
    and one candidate item.
    """

    genre_score = calculate_genre_similarity(
        watched_item,
        candidate_item
    )

    rating_score = calculate_rating_similarity(
        watched_item,
        candidate_item
    )

    media_type_score = calculate_media_type_similarity(
        watched_item,
        candidate_item
    )

    final_score = (
        0.40 * content_similarity
        + 0.35 * genre_score
        + 0.15 * rating_score
        + 0.10 * media_type_score
    )

    return round(final_score, 4)


# --------------------------------------------------
# USER PROFILE (from watchlist)
# --------------------------------------------------

def build_watchlist_profile(watchlist_items):
    """
    Build genre, rating, and media-type preferences
    from the user's watchlist.
    """

    genre_weights = Counter()
    type_weights = Counter()
    ratings = []

    for item in watchlist_items:
        rating = item.get("rating")
        try:
            weight = float(rating) if rating is not None else 7.0
        except (TypeError, ValueError):
            weight = 7.0

        for genre in get_genres(item):
            genre_weights[genre] += weight

        media_type = (item.get("media_type") or "").lower()
        if media_type:
            type_weights[media_type] += weight

        if rating is not None:
            try:
                ratings.append(float(rating))
            except (TypeError, ValueError):
                pass

    total_genre_weight = sum(genre_weights.values()) or 1.0
    genre_prefs = {
        genre: weight / total_genre_weight
        for genre, weight in genre_weights.items()
    }

    average_rating = (
        sum(ratings) / len(ratings)
        if ratings else None
    )

    preferred_type = (
        type_weights.most_common(1)[0][0]
        if type_weights else None
    )

    top_genres = [
        genre for genre, _ in genre_weights.most_common(3)
    ]

    anchor_item = None
    if watchlist_items:
        def _anchor_key(item):
            rating = item.get("rating")
            try:
                return float(rating) if rating is not None else 0.0
            except (TypeError, ValueError):
                return 0.0

        anchor_item = max(watchlist_items, key=_anchor_key)

    return {
        "genre_prefs": genre_prefs,
        "top_genres": top_genres,
        "average_rating": average_rating,
        "preferred_type": preferred_type,
        "anchor_item": anchor_item
    }


def calculate_profile_similarity(profile, candidate_item):
    """
    How well a candidate matches the user's overall taste.
    """

    genres = get_genres(candidate_item)
    if genres:
        genre_score = sum(
            profile["genre_prefs"].get(genre, 0.0)
            for genre in genres
        )
        genre_score = min(1.0, genre_score * 2.0)
    else:
        genre_score = 0.0

    if profile["average_rating"] is None:
        rating_score = 0.5
    else:
        dummy_watched = {"rating": profile["average_rating"]}
        rating_score = calculate_rating_similarity(
            dummy_watched,
            candidate_item
        )

    preferred_type = profile["preferred_type"]
    candidate_type = (candidate_item.get("media_type") or "").lower()
    if not preferred_type or not candidate_type:
        type_score = 0.5
    elif preferred_type == candidate_type:
        type_score = 1.0
    else:
        type_score = 0.15

    return round(
        0.60 * genre_score
        + 0.25 * rating_score
        + 0.15 * type_score,
        4
    )


def _assign_sections(ranked, profile, per_section=5):
    """
    Split ranked recs into Netflix-style rows without duplicates.
    Existing API items keep media + score; extra fields are additive.
    """

    used_ids = set()
    sections = {
        "top_picks": [],
        "because_you_watched": [],
        "because_you_like": []
    }

    n = len(ranked)
    if n == 0:
        return []
    if n < 9:
        per_section = max(1, (n + 2) // 3)

    top_genre = None
    if profile.get("top_genres"):
        top_genre = profile["top_genres"][0].title()

    top_cap = per_section
    if top_genre:
        matching_count = sum(
            1 for rec in ranked
            if top_genre.lower() in get_genres(rec["media"])
        )
        if matching_count >= 4:
            top_cap = min(per_section, matching_count - 1)

    for rec in ranked:
        if len(sections["top_picks"]) >= top_cap:
            break
        if rec["score"] < 0.30 and len(sections["top_picks"]) >= 1:
            break
        rec_copy = dict(rec)
        rec_copy["section"] = "top_picks"
        rec_copy["reason"] = "Top pick for you"
        sections["top_picks"].append(rec_copy)
        used_ids.add(rec["media"].get("id"))

    anchor = profile.get("anchor_item")
    if anchor:
        anchor_title = anchor.get("title") or "your watchlist"
        anchor_genres = get_genres(anchor)
        remaining = [
            rec for rec in ranked
            if rec["media"].get("id") not in used_ids
        ]
        remaining.sort(
            key=lambda rec: rec.get("best_watch_score", rec["score"]),
            reverse=True
        )
        for rec in remaining:
            if rec.get("best_watch_score", 0) < 0.32:
                candidate_genres = get_genres(rec["media"])
                if not (anchor_genres & candidate_genres):
                    continue
            if len(sections["because_you_watched"]) >= per_section:
                break
            rec_copy = dict(rec)
            rec_copy["section"] = "because_you_watched"
            rec_copy["anchor_title"] = anchor_title
            rec_copy["reason"] = (
                "Because you watched "
                + rec_copy["anchor_title"]
            )
            sections["because_you_watched"].append(rec_copy)
            used_ids.add(rec["media"].get("id"))

    if top_genre:
        remaining = [
            rec for rec in ranked
            if rec["media"].get("id") not in used_ids
        ]
        for rec in remaining:
            candidate_genres = get_genres(rec["media"])
            if top_genre.lower() not in candidate_genres:
                continue
            if len(sections["because_you_like"]) >= per_section:
                break
            rec_copy = dict(rec)
            rec_copy["section"] = "because_you_like"
            rec_copy["anchor_title"] = rec.get("anchor_title") 
            rec_copy["matched_genre"] = top_genre
            rec_copy["reason"] = "Because you like " + top_genre
            sections["because_you_like"].append(rec_copy)
            used_ids.add(rec["media"].get("id"))

    ordered = (
        sections["top_picks"]
        + sections["because_you_watched"]
        + sections["because_you_like"]
    )
    return ordered


# --------------------------------------------------
# RECOMMENDATIONS
# --------------------------------------------------

def get_recommendations(
    watchlist_items,
    candidate_items,
    limit=18
):
    """
    Generate recommendations based on content, genre,
    rating, and media-type similarity to the watchlist.
    Watched titles are never returned.
    """

    if not watchlist_items:
        return []

    watched_ids = {
        item.get("id") or item.get("media_id")
        for item in watchlist_items
        if item.get("id") or item.get("media_id")
    }

    profile = build_watchlist_profile(watchlist_items)

    all_items = watchlist_items + candidate_items

    documents = [
        build_content_text(item)
        for item in all_items
    ]

    vectors = build_tfidf_vectors(documents)

    watchlist_count = len(watchlist_items)
    watchlist_vectors = vectors[:watchlist_count]
    candidate_vectors = vectors[watchlist_count:]

    recommendations = []

    for index, media_item in enumerate(candidate_items):

        media_id = media_item.get("id")

        if not media_id or media_id in watched_ids:
            continue

        candidate_vector = candidate_vectors[index]
        pair_scores = []
        best_pair = 0.0
        best_watched = None

        for watch_index, watched_item in enumerate(watchlist_items):

            watched_vector = watchlist_vectors[watch_index]

            content_score = calculate_cosine_similarity(
                watched_vector,
                candidate_vector
            )

            score = calculate_item_similarity(
                watched_item,
                media_item,
                content_score
            )

            pair_scores.append(score)

            if score >= best_pair:
                best_pair = score
                best_watched = watched_item

        if pair_scores:
            average_score = sum(pair_scores) / len(pair_scores)
        else:
            average_score = 0.0

        profile_score = calculate_profile_similarity(
            profile,
            media_item
        )

        # Prefer the closest watchlist match so results follow
        # what the user actually saved, not a washed-out average.
        final_score = (
            0.55 * best_pair
            + 0.25 * average_score
            + 0.20 * profile_score
        )

        if final_score < 0.12:
            continue

        recommendations.append({
            "media": media_item,
            "score": round(final_score, 4),
            "best_watch_score": round(best_pair, 4),
            "anchor_title": (
                best_watched.get("title") if best_watched else None
            ),
            "matched_genre": (
                profile["top_genres"][0].title()
                if profile["top_genres"] else None
            )
        })

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    sectioned = _assign_sections(recommendations, profile)

    if sectioned:
        return sectioned[:limit]

    return recommendations[:limit]


# --------------------------------------------------
# LOCAL TEST
# --------------------------------------------------

if __name__ == "__main__":

    watchlist = [

        {
            "id": "1",
            "title": "Interstellar",
            "genre": "Sci-Fi, Drama",
            "description": (
                "A team of explorers travel through "
                "a wormhole in space to ensure humanity's survival."
            ),
            "rating": 8.7,
            "media_type": "movie"
        },

        {
            "id": "2",
            "title": "The Martian",
            "genre": "Sci-Fi, Drama",
            "description": (
                "An astronaut becomes stranded on Mars "
                "and must survive until he can be rescued."
            ),
            "rating": 8.0,
            "media_type": "movie"
        }
    ]

    candidates = [

        {
            "id": "3",
            "title": "Arrival",
            "genre": "Sci-Fi, Drama",
            "description": (
                "A linguist works with scientists "
                "to communicate with mysterious aliens."
            ),
            "rating": 8.0,
            "media_type": "movie"
        },

        {
            "id": "4",
            "title": "Random Comedy",
            "genre": "Comedy",
            "description": (
                "A group of friends get into "
                "funny situations."
            ),
            "rating": 6.0,
            "media_type": "movie"
        }
    ]

    results = get_recommendations(
        watchlist,
        candidates
    )

    for result in results:

        print(
            result["media"]["title"],
            "->",
            result["score"]
        )