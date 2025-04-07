import pymysql

def connect_to_database():
    try:
        connection = pymysql.connect(
            host="localhost",
            user="root",
            password="A9v@Lp!3bZ",
            database="payment_portal"
        )
        print("Connection successful")
        return connection
    except pymysql.MySQLError as err:
        print(f"Error: {err}")

def close_connection(connection):
    if connection.is_connected():
        connection.close()