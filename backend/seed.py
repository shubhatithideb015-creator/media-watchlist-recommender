from database import get_db_connection

connection = get_db_connection()

movies = [
    (
        "Interstellar",
        "A group of astronauts travel through a wormhole in search of a new home for humanity.",
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5H5l0Q.jpg",
        "Sci-Fi",
        8.7,
        2014,
        "movie"
    ),
    (
        "Inception",
        "A skilled thief enters people's dreams to steal valuable secrets.",
        "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        "Sci-Fi",
        8.8,
        2010,
        "movie"
    ),
    (
        "The Dark Knight",
        "Batman faces a criminal mastermind who plunges Gotham into chaos.",
        "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzbVxk.jpg",
        "Action",
        9.0,
        2008,
        "movie"
    ),
    (
        "Stranger Things",
        "A group of friends uncover mysterious events in their small town.",
        "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
        "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
        "Sci-Fi",
        8.6,
        2016,
        "series"
    )
]

connection.executemany("""
    INSERT INTO media
    (title, description, poster_url, backdrop_url, genre, rating, release_year, media_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", movies)

connection.commit()
connection.close()

print("Movies added successfully!")