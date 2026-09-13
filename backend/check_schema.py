import sqlite3

conn = sqlite3.connect('cinematch.db')
cursor = conn.cursor()

print('Watchlist schema:')
cursor.execute('PRAGMA table_info(watchlist)')
for col in cursor.fetchall():
    print(col)

print('\nWatchlist data:')
cursor.execute('SELECT * FROM watchlist')
for row in cursor.fetchall():
    print(row)

conn.close()
