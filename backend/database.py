import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cinematch.db")

def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    return connection