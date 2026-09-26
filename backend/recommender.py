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
        0.50 * content_similarity
        + 0.30 * genre_score
        + 0.15 * rating_score
        + 0.05 * media_type_score
    )

    return round(final_score, 4)


# --------------------------------------------------
# RECOMMENDATIONS
# --------------------------------------------------

def get_recommendations(
    watchlist_items,
    candidate_items,
    limit=10
):
    """
    Generate recommendations based on content
    similarity to the user's watchlist.
    """

    if not watchlist_items:
        return []

    watched_ids = {
        item.get("id") or item.get("media_id")
        for item in watchlist_items
    }

    # ----------------------------------------------
    # Build one TF-IDF corpus
    # ----------------------------------------------

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

    # ----------------------------------------------
    # Compare every candidate with watchlist
    # ----------------------------------------------

    for index, media_item in enumerate(candidate_items):

        media_id = media_item.get("id")

        # Never recommend something already watched
        if media_id in watched_ids:
            continue

        candidate_vector = candidate_vectors[index]
        scores = []

        for watch_index, watched_item in enumerate(
            watchlist_items
        ):

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

            scores.append(score)

        if scores:
            best_score = sum(scores) / len(scores)
        else:
            best_score = 0.0
        
        recommendations.append({
            "media": media_item,
            "score": best_score
        })
    # ----------------------------------------------
    # Highest similarity first
    # ----------------------------------------------

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

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