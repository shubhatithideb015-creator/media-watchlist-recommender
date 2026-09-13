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