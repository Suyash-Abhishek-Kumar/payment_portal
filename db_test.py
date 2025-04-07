import mysql.connector

try:
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="A9v@Lp!3bZ",  # Replace with your actual password
        database="payment_portal"
    )
    if connection.is_connected():
        print("Connection Successful")
    connection.close()
except mysql.connector.Error as err:
    print(f"Connection Failed: {err}")
