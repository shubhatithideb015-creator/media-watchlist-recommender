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
    Rebuild watchlist when missing, non-TEXT media_id, legacy FOREIGN KEY,
    or missing user_id column (for user-specific watchlist migration).
    CREATE TABLE IF NOT EXISTS will not migrate an old schema.
    """
    cursor.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='watchlist'"
    )
    row = cursor.fetchone()
    if row is None:
        return False

    table_sql = (row[0] or "").upper()

    cursor.execute("PRAGMA table_info(watchlist)")
    columns = cursor.fetchall()
    media_id_col = next((col for col in columns if col[1] == "media_id"), None)
    if media_id_col is None:
        return True

    col_type = str(media_id_col[2] or "").upper()
    if col_type != "TEXT":
        return True

    # Check if user_id column exists (new schema requirement)
    user_id_col = next((col for col in columns if col[1] == "user_id"), None)
    if user_id_col is None:
        return True

    # Check if UNIQUE constraint is on (user_id, media_id) not just media_id
    if "UNIQUE(media_id)" in table_sql and "UNIQUE(user_id, media_id)" not in table_sql:
        return True

    return False


def _migrate_watchlist_data(cursor):
    """
    Migrate existing watchlist data from old schema (no user_id) to new schema.
    Assigns existing items to user_id=1 as a default for development data.
    """
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='watchlist'")
    row = cursor.fetchone()
    if row is None:
        return

    table_sql = (row[0] or "").upper()
    cursor.execute("PRAGMA table_info(watchlist)")
    columns = cursor.fetchall()
    user_id_col = next((col for col in columns if col[1] == "user_id"), None)

    # Only migrate if old schema exists (no user_id column)
    if user_id_col is None and "watchlist" in table_sql:
        # Backup existing data
        cursor.execute("SELECT media_id FROM watchlist")
        existing_items = cursor.fetchall()

        if existing_items:
            # After table is recreated, insert with user_id=1
            for (media_id,) in existing_items:
                try:
                    cursor.execute(
                        "INSERT INTO watchlist (user_id, media_id) VALUES (?, ?)",
                        (1, media_id)
                    )
                except sqlite3.IntegrityError:
                    # Skip duplicates
                    pass


def init_db():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if we need to migrate existing data before dropping
    needs_migration = False
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='watchlist'")
    row = cursor.fetchone()
    if row:
        table_sql = (row[0] or "").upper()
        cursor.execute("PRAGMA table_info(watchlist)")
        columns = cursor.fetchall()
        user_id_col = next((col for col in columns if col[1] == "user_id"), None)
        if user_id_col is None and "watchlist" in table_sql:
            needs_migration = True

    if _watchlist_needs_rebuild(cursor):
        if needs_migration:
            # Backup data before dropping
            cursor.execute("SELECT media_id FROM watchlist")
            existing_items = cursor.fetchall()
        else:
            existing_items = []

        cursor.execute("DROP TABLE IF EXISTS watchlist")
        connection.commit()

        with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
            schema = file.read()

        cursor.executescript(schema)
        connection.commit()

        # Restore migrated data with user_id=1
        if existing_items:
            for (media_id,) in existing_items:
                try:
                    cursor.execute(
                        "INSERT INTO watchlist (user_id, media_id) VALUES (?, ?)",
                        (1, media_id)
                    )
                except sqlite3.IntegrityError:
                    pass
            connection.commit()
    else:
        # Apply schema to ensure new tables exist
        with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
            schema = file.read()
        cursor.executescript(schema)
        connection.commit()

    connection.close()
