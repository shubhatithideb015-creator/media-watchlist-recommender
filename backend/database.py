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

    schema_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "schema.sql"
    )

    with open(schema_path, "r") as file:
        schema = file.read()

    connection.executescript(schema)
    connection.commit()
    connection.close()
