import sqlite3


def get_db_connection():
    connection = sqlite3.connect("cinematch.db")
    return connection


def init_db():
    connection = get_db_connection()

    with open("schema.sql", "r") as file:
        schema = file.read()

    connection.executescript(schema)
    connection.commit()
    connection.close()

    