from collections import Counter


def _rating_weight(item):
    rating = item.get("rating")
    if rating is None:
        return 7.0
    try:
        value = float(rating)
    except (TypeError, ValueError):
        return 7.0
    return max(1.0, min(value, 10.0))


def _split_genres(item):
    genre_text = item.get("genre") or ""
    genres = []
    seen = set()
    for raw in genre_text.split(","):
        genre = raw.strip()
        if not genre:
            continue
        key = genre.lower()
        if key in seen:
            continue
        seen.add(key)
        genres.append(genre)
    return genres


def calculate_genre_dna(watchlist_items):
    """
    Genre mix weighted by IMDb rating so highly rated
    watchlist titles influence Taste DNA more than filler.
    Response shape stays {genre, count, percentage}.
    """
    title_counts = Counter()
    weighted_counts = Counter()

    for item in watchlist_items:
        weight = _rating_weight(item)
        for genre in _split_genres(item):
            title_counts[genre] += 1
            weighted_counts[genre] += weight

    total_weight = sum(weighted_counts.values())

    if total_weight == 0:
        return []

    dna = []

    for genre, count in title_counts.items():
        percentage = round((weighted_counts[genre] / total_weight) * 100)
        dna.append({
            "genre": genre,
            "count": count,
            "percentage": percentage
        })

    dna.sort(
        key=lambda item: (
            weighted_counts[item["genre"]],
            item["count"]
        ),
        reverse=True
    )

    return dna


def calculate_rating_dna(watchlist_items):
    """
    Rating profile plus preferred media type from the watchlist.
    Keeps average_rating and category for the existing frontend.
    """
    ratings = []
    type_weights = Counter()

    for item in watchlist_items:
        rating = item.get("rating")
        if rating is not None:
            try:
                ratings.append(float(rating))
            except (TypeError, ValueError):
                pass

        media_type = (item.get("media_type") or "").strip().lower()
        if media_type:
            type_weights[media_type] += _rating_weight(item)

    if not ratings:
        return {
            "average_rating": None,
            "category": "Not enough data",
            "title_count": 0,
            "preferred_media_type": None
        }

    average_rating = round(sum(ratings) / len(ratings), 1)

    if average_rating >= 8.0:
        category = "Highly Rated"
    elif average_rating >= 7.0:
        category = "Well Rated"
    elif average_rating >= 6.0:
        category = "Moderately Rated"
    else:
        category = "Mixed Ratings"

    preferred_media_type = None
    if type_weights:
        preferred_media_type = type_weights.most_common(1)[0][0]

    return {
        "average_rating": average_rating,
        "category": category,
        "title_count": len(ratings),
        "preferred_media_type": preferred_media_type
    }


if __name__ == "__main__":
    test_movies = [
        {"genre": "Sci-Fi, Drama", "rating": 8.7, "media_type": "movie"},
        {"genre": "Sci-Fi, Thriller", "rating": 8.5, "media_type": "movie"},
        {"genre": "Drama", "rating": 6.0, "media_type": "series"}
    ]

    print(calculate_genre_dna(test_movies))
    print(calculate_rating_dna(test_movies))
