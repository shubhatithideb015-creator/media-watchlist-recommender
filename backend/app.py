import os
from flask import Flask, request
from flask_cors import CORS
from database import get_db_connection, init_db
from omdb import search_media, fetch_media_detail

app = Flask(__name__)
CORS(app)
init_db()


@app.route("/")
def home():
    return {
        "message": "CineMatch Backend API is running successfully"
    }


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


@app.route('/api/version')
def version():
    return {"version": "v3_watchlist_fix"}


@app.route('/api/media')
def media():
    try:
        media_list = []
        for imdb_id in CURATED_MEDIA:
            item = fetch_media_detail(imdb_id)
            if item is not None:
                media_list.append(item)
        return media_list
    except Exception as e:
        app.logger.error(f"Error in media: {e}", exc_info=True)
        return {"error": "Internal server error"}, 500


@app.route('/api/media/<id>')
def media_detail(id):
    try:
        if not id or not str(id).strip():
            return {"error": "Media not found"}, 404

        item = fetch_media_detail(str(id).strip())
        if item is None:
            return {"error": "Media not found"}, 404
        return item
    except Exception as e:
        app.logger.error(f"Error in media_detail: {e}", exc_info=True)
        return {"error": "Internal server error"}, 500


@app.route('/api/search')
def search_movies():
    try:
        query = request.args.get('q')
        if not query or not query.strip():
            return {"error": "Search query is required"}, 400

        results = search_media(query.strip())
        return results
    except Exception as e:
        app.logger.error(f"Error in search_movies: {e}", exc_info=True)
        return {"error": "Internal server error"}, 500


# ==================================================
# WATCHLIST ENDPOINTS (IMDb String IDs)
# ==================================================

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute('SELECT media_id FROM watchlist')
        rows = cursor.fetchall()
        connection.close()
        connection = None

        watchlist_items = []
        for row in rows:
            media_id = row[0]
            item = fetch_media_detail(media_id)
            if item is not None:
                watchlist_items.append(item)

        return watchlist_items

    except Exception as e:
        if connection:
            connection.close()
        app.logger.error(f"Error in get_watchlist: {e}", exc_info=True)
        return {"error": f"Internal server error: {type(e).__name__}: {str(e)}"}, 500


@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    connection = None
    try:
        data = request.get_json(silent=True)

        if data is None:
            return {"error": "Request body is required"}, 400

        if "media_id" not in data or not data["media_id"] or not str(data["media_id"]).strip():
            return {"error": "media_id is required"}, 400

        media_id = str(data["media_id"]).strip()

        # Check if media exists in OMDb
        item = fetch_media_detail(media_id)
        if item is None:
            return {"error": "Media not found"}, 404

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if already in watchlist
        cursor.execute('SELECT id FROM watchlist WHERE media_id = ?', (media_id,))
        existing = cursor.fetchone()
        if existing is not None:
            connection.close()
            connection = None
            return {"error": "Media already in watchlist"}, 409

        # Add IMDb ID to watchlist
        cursor.execute('INSERT INTO watchlist (media_id) VALUES (?)', (media_id,))
        connection.commit()
        connection.close()
        connection = None

        return {"message": "Media added to watchlist"}, 201

    except Exception as e:
        if connection:
            connection.close()
        app.logger.error(f"Error in add_to_watchlist: {e}", exc_info=True)
        return {"error": f"Internal server error: {type(e).__name__}: {str(e)}"}, 500


@app.route('/api/watchlist/<media_id>', methods=['DELETE'])
def remove_from_watchlist(media_id):
    connection = None
    try:
        if not media_id or not str(media_id).strip():
            return {"error": "Media not in watchlist"}, 404

        target_id = str(media_id).strip()

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if media_id exists in watchlist
        cursor.execute('SELECT id FROM watchlist WHERE media_id = ?', (target_id,))
        existing = cursor.fetchone()
        if existing is None:
            connection.close()
            connection = None
            return {"error": "Media not in watchlist"}, 404

        # Delete from watchlist
        cursor.execute('DELETE FROM watchlist WHERE media_id = ?', (target_id,))
        connection.commit()
        connection.close()
        connection = None

        return {"message": "Media removed from watchlist"}, 200

    except Exception as e:
        if connection:
            connection.close()
        app.logger.error(f"Error in remove_from_watchlist: {e}", exc_info=True)
        return {"error": f"Internal server error: {type(e).__name__}: {str(e)}"}, 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
