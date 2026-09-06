CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    genre TEXT,
    rating REAL,
    release_year INTEGER,
    media_type TEXT
);

CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id TEXT NOT NULL UNIQUE
);