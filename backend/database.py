import os
import sqlite3
import tempfile

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))


def _resolve_db_path():
    """
    Resolve SQLite path relative to the backend package directory.
    On Render, use the system temp dir so the DB is always writable.
    """
    env_path = os.environ.get("DATABASE_PATH")
    if env_path:
        return env_path

    if os.environ.get("RENDER"):
        return os.path.join(tempfile.gettempdir(), "cinematch.db")

    return os.path.join(BACKEND_DIR, "cinematch.db")


DB_PATH = _resolve_db_path()
SCHEMA_PATH = os.path.join(BACKEND_DIR, "schema.sql")


def get_db_connection():
    db_path = _resolve_db_path()
    connection = sqlite3.connect(db_path)
    # Watchlist stores IMDb string IDs; never enforce legacy media-table FKs.
    connection.execute("PRAGMA foreign_keys = OFF")
    return connection


def _watchlist_needs_rebuild(cursor):
    """
    Rebuild watchlist when missing, non-TEXT media_id, or legacy FOREIGN KEY.
    CREATE TABLE IF NOT EXISTS will not migrate an old INTEGER/FK table.
    """
    cursor.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='watchlist'"
    )
    row = cursor.fetchone()
    if row is None:
        return False

    table_sql = (row[0] or "").upper()
    if "FOREIGN KEY" in table_sql:
        return True

    cursor.execute("PRAGMA table_info(watchlist)")
    columns = cursor.fetchall()
    media_id_col = next((col for col in columns if col[1] == "media_id"), None)
    if media_id_col is None:
        return True

    col_type = str(media_id_col[2] or "").upper()
    return col_type != "TEXT"


def init_db():
    connection = get_db_connection()
    cursor = connection.cursor()

    if _watchlist_needs_rebuild(cursor):
        cursor.execute("DROP TABLE IF EXISTS watchlist")
        connection.commit()

    with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
        schema = file.read()

    cursor.executescript(schema)
    connection.commit()
    connection.close()
