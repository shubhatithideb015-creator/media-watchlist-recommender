def build_user_profile(watchlist_items):
    """
    Build a user preference profile from their watchlist.
    """

    genre_counts = {}
    ratings = []
    media_type_counts = {}

    for item in watchlist_items:

        # -------------------------
        # Genre preferences
        # -------------------------
        genre_text = item.get("genre") or ""

        genres = [
            genre.strip()
            for genre in genre_text.split(",")
            if genre.strip()
        ]

        for genre in genres:
            genre_counts[genre] = genre_counts.get(genre, 0) + 1

        # -------------------------
        # Rating preference
        # -------------------------
        rating = item.get("rating")

        if rating is not None:
            ratings.append(float(rating))

        # -------------------------
        # Movie / Series preference
        # -------------------------
        media_type = item.get("media_type")

        if media_type:
            media_type_counts[media_type] = (
                media_type_counts.get(media_type, 0) + 1
            )

    # -------------------------
    # Normalize genre weights
    # -------------------------
    total_genres = sum(genre_counts.values())

    if total_genres > 0:
        genre_preferences = {
            genre: round(count / total_genres, 3)
            for genre, count in genre_counts.items()
        }
    else:
        genre_preferences = {}

    # -------------------------
    # Average rating
    # -------------------------
    if ratings:
        average_rating = round(sum(ratings) / len(ratings), 2)
    else:
        average_rating = None

    # -------------------------
    # Preferred media type
    # -------------------------
    if media_type_counts:
        preferred_media_type = max(
            media_type_counts,
            key=media_type_counts.get
        )
    else:
        preferred_media_type = None

    return {
        "genre_preferences": genre_preferences,
        "average_rating": average_rating,
        "preferred_media_type": preferred_media_type
    }
def calculate_genre_score(user_profile, media_item):
    genre_preferences = user_profile["genre_preferences"]

    genre_text = media_item.get("genre") or ""

    genres = [
        genre.strip()
        for genre in genre_text.split(",")
        if genre.strip()
    ]

    if not genres:
        return 0.0

    matched_weight = sum(
        genre_preferences.get(genre, 0)
        for genre in genres
    )

    return min(matched_weight, 1.0)
def calculate_rating_score(user_profile, media_item):
    user_average = user_profile.get("average_rating")
    media_rating = media_item.get("rating")

    if user_average is None or media_rating is None:
        return 0.5

    difference = abs(
        float(media_rating) - float(user_average)
    )

    score = max(0.0, 1.0 - (difference / 5.0))

    return round(score, 3)

def calculate_media_type_score(user_profile, media_item):
    preferred_type = user_profile.get("preferred_media_type")
    media_type = media_item.get("media_type")

    if not preferred_type or not media_type:
        return 0.5

    if preferred_type.lower() == media_type.lower():
        return 1.0

    return 0.0 
def calculate_final_score(user_profile, media_item):
    genre_score = calculate_genre_score(user_profile,media_item
)

    rating_score = calculate_rating_score(user_profile,media_item
)

    media_type_score = calculate_media_type_score(user_profile,media_item
)

    final_score = (
        0.50 * genre_score
        + 0.30 * rating_score
        + 0.20 * media_type_score
    )

    return round(final_score, 4)  
def get_recommendations(watchlist_items, candidate_items, limit=10):
    user_profile = build_user_profile(watchlist_items)

    recommendations = []

    watched_ids = {
        item.get("id") or item.get("media_id")
        for item in watchlist_items
    }

    for media_item in candidate_items:

        media_id = media_item.get("id")

        # Don't recommend something already in the watchlist
        if media_id in watched_ids:
            continue

        score = calculate_final_score(
            user_profile,
            media_item
        )

        recommendations.append({
            "media": media_item,
            "score": score
        })

    # Highest score first
    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )
    return recommendations[:limit]
if __name__ == "__main__":

    watchlist = [
        {
            "id": "1",
            "genre": "Sci-Fi, Drama",
            "rating": 8.7,
            "media_type": "movie"
        },
        {
            "id": "2",
            "genre": "Sci-Fi, Thriller",
            "rating": 8.8,
            "media_type": "movie"
        },
        {
            "id": "3",
            "genre": "Drama",
            "rating": 8.3,
            "media_type": "movie"
        }
    ]

    candidates = [
        {
            "id": "4",
            "title": "The Martian",
            "genre": "Sci-Fi, Drama",
            "rating": 8.0,
            "media_type": "movie"
        },
        {
            "id": "5",
            "title": "Random Comedy",
            "genre": "Comedy",
            "rating": 6.0,
            "media_type": "movie"
        },
        {
            "id": "6",
            "title": "Arrival",
            "genre": "Sci-Fi, Drama",
            "rating": 8.0,
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