import os
import sqlite3

DB_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "cinematch.db"
)


def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    return connection


def init_db():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Drop legacy watchlist table if media_id is integer type
    cursor.execute("PRAGMA table_info(watchlist)")
    columns = cursor.fetchall()
    if columns:
        media_id_col = next((col for col in columns if col[1] == 'media_id'), None)
        if media_id_col and 'INT' in str(media_id_col[2]).upper():
            cursor.execute("DROP TABLE watchlist")

    schema_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "schema.sql"
    )

    with open(schema_path, "r") as file:
        schema = file.read()

    cursor.executescript(schema)
    connection.commit()
    connection.close()
