from flask import Flask, request
from database import get_db_connection, init_db
from omdb import search_media, fetch_media_detail

app = Flask(__name__)
init_db()
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
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute('SELECT media_id FROM watchlist')
        rows = cursor.fetchall()

        connection.close()

        watchlist_items = []

        for row in rows:
            media_id = row[0]

            # Get complete movie details from OMDb
            item = fetch_media_detail(media_id)

            if item is not None:
                watchlist_items.append(item)

        return watchlist_items

    except Exception:
        return {"error": "Internal server error"}, 500

@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    try:
        data = request.get_json(silent=True)

        if data is None:
            return {"error": "Request body is required"}, 400

        if "media_id" not in data:
            return {"error": "media_id is required"}, 400

        media_id = str(data["media_id"]).strip()

        if not media_id:
            return {"error": "media_id is required"}, 400

        # Check if media exists in OMDb
        item = fetch_media_detail(media_id)

        if item is None:
            return {"error": "Media not found"}, 404

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if already in watchlist
        cursor.execute(
            'SELECT id FROM watchlist WHERE media_id = ?',
            (media_id,)
        )

        existing = cursor.fetchone()

        if existing is not None:
            connection.close()
            return {"error": "Media already in watchlist"}, 409

        # Add IMDb ID to watchlist
        cursor.execute(
            'INSERT INTO watchlist (media_id) VALUES (?)',
            (media_id,)
        )

        connection.commit()
        connection.close()

        return {"message": "Media added to watchlist"}, 201

    except Exception:
        return {"error": "Internal server error"}, 500


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
