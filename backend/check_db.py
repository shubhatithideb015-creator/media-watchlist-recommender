from database import get_db_connection

connection = get_db_connection()

tables = connection.execute("""
    SELECT name
    FROM sqlite_master
    WHERE type='table';
""").fetchall()

print("Tables in database:")
for table in tables:
    print(table[0])

connection.close()