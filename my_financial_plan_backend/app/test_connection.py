from my_financial_plan_backend.app.db import Database

conn, cursor = Database.connect()

cursor.execute("SHOW TABLES;")
tables = cursor.fetchall()

print("Tables in database:", tables)