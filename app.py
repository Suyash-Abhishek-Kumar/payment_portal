import os
from flask import Flask, render_template, request, redirect, url_for, abort
import pymysql

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

def connect_to_database():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="A9v@Lp!3bZ",
        database="payment_portal"
    )

def close_connection(connection):
    if connection.open:
        connection.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/transactions')
def transactions():
    return render_template('transactions.html')

@app.route('/transfers')
def transfers():
    return render_template('transfers.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/users')
def show_users():
    try:
        connection = connect_to_database()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT u.user_id, u.username, u.email, 
                   COUNT(t.transaction_id) AS transaction_count,
                   SUM(t.amount) AS total_spent
            FROM users u
            LEFT JOIN transactions t ON u.user_id = t.user_id
            GROUP BY u.user_id
        """)
        
        users = cursor.fetchall()
        return render_template('users.html', users=users)

    except pymysql.MySQLError as err:
        app.logger.error(f"Database error: {err}")
        abort(500, description="Database connection failed")
        
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        abort(500)
        
    finally:
        if 'connection' in locals() and connection.open:
            close_connection(connection)

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html', error=error.description), 500

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

if __name__ == "__main__":
    app.run(debug=True)