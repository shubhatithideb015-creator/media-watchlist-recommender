from flask import Flask, request
from database import get_db_connection
from omdb import search_media, fetch_media_detail

app = Flask(__name__)

# Curated catalog of IMDb IDs for /api/media endpoint
CURATED_MEDIA = [
    "tt0816692",
    "tt1375666",
    "tt0468569",
    "tt0903747",
    "tt0944947"
]


@app.route('/api/health')
def health():
    return {"status": "ok"}


@app.route('/api/test')
def test():
    return {"message": "CineMatch Backend"}


@app.route('/api/media')
def media():
    media_list = []
    for imdb_id in CURATED_MEDIA:
        item = fetch_media_detail(imdb_id)
        if item is not None:
            media_list.append(item)
    return media_list


@app.route('/api/media/<id>')
def media_detail(id):
    item = fetch_media_detail(id)
    if item is None:
        return {"error": "Media not found"}, 404
    return item


@app.route('/api/search')
def search_movies():
    query = request.args.get('q')
    if not query or not query.strip():
        return {"error": "Search query is required"}, 400

    results = search_media(query)
    return results


# ==================================================
# WATCHLIST ENDPOINTS (SQLite)
# ==================================================

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            media.id,
            media.title,
            media.description,
            media.poster_url,
            media.backdrop_url,
            media.genre,
            media.rating,
            media.release_year,
            media.media_type
        FROM watchlist
        JOIN media ON watchlist.media_id = media.id
    """)

    rows = cursor.fetchall()

    watchlist_items = []
    for row in rows:
        item = {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "poster_url": row[3],
            "backdrop_url": row[4],
            "genre": row[5],
            "rating": row[6],
            "release_year": row[7],
            "media_type": row[8]
        }
        watchlist_items.append(item)

    connection.close()
    return watchlist_items


@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    data = request.get_json(silent=True)

    if data is None:
        return {"error": "Request body is required"}, 400

    if "media_id" not in data:
        return {"error": "media_id is required"}, 400

    media_id = data["media_id"]

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if media exists in media table
    cursor.execute('SELECT id FROM media WHERE id = ?', (media_id,))
    row = cursor.fetchone()
    if row is None:
        connection.close()
        return {"error": "Media not found"}, 404

    # Check if media_id already exists in watchlist
    cursor.execute('SELECT id FROM watchlist WHERE media_id = ?', (media_id,))
    existing = cursor.fetchone()
    if existing is not None:
        connection.close()
        return {"error": "Media already in watchlist"}, 409

    # Insert into watchlist
    cursor.execute('INSERT INTO watchlist (media_id) VALUES (?)', (media_id,))
    connection.commit()
    connection.close()

    return {"message": "Media added to watchlist"}, 201


@app.route('/api/watchlist/<int:media_id>', methods=['DELETE'])
def remove_from_watchlist(media_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if media_id exists in watchlist
    cursor.execute('SELECT id FROM watchlist WHERE media_id = ?', (media_id,))
    existing = cursor.fetchone()
    if existing is None:
        connection.close()
        return {"error": "Media not in watchlist"}, 404

    # Delete from watchlist
    cursor.execute('DELETE FROM watchlist WHERE media_id = ?', (media_id,))
    connection.commit()
    connection.close()

    return {"message": "Media removed from watchlist"}, 200


if __name__ == '__main__':
    app.run(debug=True)
