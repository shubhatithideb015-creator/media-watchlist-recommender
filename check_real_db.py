import sqlite3

conn = sqlite3.connect(r"backend\cinematch.db")
cursor = conn.cursor()

print("TABLES:")
print(cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
).fetchall())

print("\nWATCHLIST SCHEMA:")
print(cursor.execute(
    "PRAGMA table_info(watchlist)"
).fetchall())

print("\nWATCHLIST DATA:")
print(cursor.execute(
    "SELECT * FROM watchlist"
).fetchall())

conn.close()