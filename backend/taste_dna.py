def calculate_genre_dna(watchlist_items):
    genre_counts = {}

    for item in watchlist_items:
        genre_text = item.get("genre") or ""

        genres = [genre.strip() for genre in genre_text.split(",") if genre.strip()]

        for genre in genres:
            genre_counts[genre] = genre_counts.get(genre, 0) + 1

    total = sum(genre_counts.values())

    if total == 0:
        return []

    dna = []

    for genre, count in genre_counts.items():
        percentage = round((count / total) * 100)

        dna.append({
            "genre": genre,
            "count": count,
            "percentage": percentage
        })

    dna.sort(key=lambda item: item["count"], reverse=True)

    return dna
if __name__ == "__main__":
    test_movies = [
        {"genre": "Sci-Fi, Drama"},
        {"genre": "Sci-Fi, Thriller"},
        {"genre": "Drama"}
    ]

    print(calculate_genre_dna(test_movies))

def calculate_rating_dna(watchlist_items):
    ratings = []

    for item in watchlist_items:
        rating = item.get("rating")

        if rating is not None:
            ratings.append(rating)

    if not ratings:
        return {
            "average_rating": None,
            "category": "Not enough data"
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

    return {
        "average_rating": average_rating,
        "category": category
    }
if __name__ == "__main__":
    test_movies = [
        {"rating": 8.7},
        {"rating": 8.5},
        {"rating": 7.9},
        {"rating": 9.0}
    ]

    print(calculate_rating_dna(test_movies))