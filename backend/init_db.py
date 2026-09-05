from database import get_db_connection

connection = get_db_connection()

with open("schema.sql", "r") as file:
    schema = file.read()
print("SCHEMA CONTENT:")
print(schema)
connection.executescript(schema)
connection.commit()
connection.close()

print("Database initialized successfully!")