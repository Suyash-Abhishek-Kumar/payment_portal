import os
from flask import Flask, render_template, request, send_file, url_for, abort, jsonify
import pymysql
from werkzeug.utils import secure_filename
import bcrypt
import io
from flask_cors import CORS

# create the app
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})
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
def login_page():
    return render_template('login.html')

@app.route('/signup')
def signup_page():
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

#API Part

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            # Check if email already exists
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"error": "Email already exists"}), 400

            # Hash the password using bcrypt
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            # Insert new user into the database
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed_password.decode('utf-8'))
            )
            user_id = cursor.lastrowid

            # Create default account balances for the new user
            cursor.execute(
                """INSERT INTO user_accounts 
                (user_id, main_balance, savings_balance, credit_balance, reward_points)
                VALUES (%s, 0.00, 0.00, 0.00, 0)""",
                (user_id,)
            )
            connection.commit()

            return jsonify({
                "message": "Signup successful",
                "user_id": user_id,
                "username": username
            }), 201

    except Exception as e:
        print("Error during signup:", str(e))  # Detailed error log
        return jsonify({"error": str(e)}), 500
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    captcha = data.get('captchaDone')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id, username, password FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            # Debug: Print stored hash and input password
            print("Stored hash:", user[2])
            print("Input password:", password)
            print("Captcha status:", captcha)
            if bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')) and captcha:
                return jsonify({
                    "message": "Login successful",
                    "user_id": user[0],
                    "username": user[1]
                }), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        connection.close()


def get_account_summary(user_id):
    connection = connect_to_database()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT main_balance, savings_balance, 
                       credit_balance, reward_points
                FROM user_accounts
                WHERE user_id = %s
            """, (user_id,))
            result = cursor.fetchone()
            if result:
                return {
                    "main_balance": result[0],
                    "savings_balance": result[1],
                    "credit_balance": result[2],
                    "reward_points": result[3]
                }
            else:
                return {"error": "User not found"}
    finally:
        connection.close()

# API endpoint for account summary
@app.route('/api/account/<int:user_id>', methods=['GET'])
def account_summary(user_id):
    summary = get_account_summary(user_id)
    return jsonify(summary)

@app.route('/api/currentUser/<user_id>', methods=['GET'])
def userName(user_id):
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("SELECT username FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            if user:
                return jsonify({"username": user[0]}), 200
            else:
                return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print("Error fetching username:", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        connection.close()

@app.route('/api/upload-qr', methods=['POST'])
def upload_qr():
    if 'qr_image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['qr_image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    user_id = request.form.get('user_id')

    try:
        filename = secure_filename(file.filename)
        mime_type = file.mimetype
        
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO user_qr_codes 
                (user_id, image_data, filename, mime_type)
                VALUES (%s, %s, %s, %s)
            """, (user_id, file.read(), filename, mime_type))
            connection.commit()
        
        return jsonify({"message": "QR code uploaded successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route('/api/user-qr/<int:user_id>')
def get_user_qr(user_id):
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT image_data, mime_type FROM user_qr_codes
                WHERE user_id = %s
                ORDER BY uploaded_at DESC
                LIMIT 1
            """, (user_id,))
            qr = cursor.fetchone()
            if not qr:
                return '', 404  # Or return a default image

            image_bytes = qr[0]
            mime_type = qr[1]
            return send_file(io.BytesIO(image_bytes), mimetype=mime_type)
    except Exception as e:
        return str(e), 500
    finally:
        connection.close()

from decimal import Decimal

@app.route('/api/transfers', methods=['POST'])
def transfer_funds():
    data = request.json
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    amount = data.get('amount')
    account_type = data.get('account_type', 'main')  # 'main', 'savings', or 'credit'
    description = data.get('description', 'Fund Transfer')

    if not all([sender_id, receiver_id, amount]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except:
        return jsonify({"error": "Invalid amount"}), 400

    # Map account_type to the correct column
    balance_columns = {
        'main': 'main_balance',
        'savings': 'savings_balance',
        'credit': 'credit_balance'
    }
    if account_type not in balance_columns:
        return jsonify({"error": "Invalid account type"}), 400

    column = balance_columns[account_type]

    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            # Check sender's balance for the selected account
            cursor.execute(f"SELECT {column} FROM user_accounts WHERE user_id = %s", (sender_id,))
            result = cursor.fetchone()
            if not result:
                return jsonify({"error": "Sender not found"}), 404
            sender_balance = result[0]

            if sender_balance < amount:
                return jsonify({"error": "Insufficient funds"}), 400

            # Add to receiver's main balance
            cursor.execute("""
                UPDATE user_accounts
                SET main_balance = main_balance + %s
                WHERE user_id = %s
            """, (amount, receiver_id))

            # Record transaction
            cursor.execute("""
                INSERT INTO transactions (user_id, amount, description, status)
                VALUES (%s, %s, %s, 'COMPLETED')
            """, (sender_id, -amount, description))

            connection.commit()
            return jsonify({"message": "Transfer successful"}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()
    
@app.route('/api/transactions/<int:user_id>', methods=['GET'])
def get_transactions(user_id):
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT t.transaction_id, t.amount, t.description, t.transaction_date, sc.name AS category
                FROM transactions t
                LEFT JOIN transaction_category tc ON t.transaction_id = tc.transaction_id
                LEFT JOIN spending_categories sc ON tc.category_id = sc.category_id
                WHERE t.user_id = %s
                ORDER BY t.transaction_date DESC
            """, (user_id,))
            transactions = cursor.fetchall()
            return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route('/api/bills/<int:user_id>', methods=['GET'])
def get_upcoming_bills(user_id):
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT bill_id, bill_type, due_date, amount 
                FROM user_bills 
                WHERE user_id = %s AND is_paid = FALSE
                ORDER BY due_date ASC
            """, (user_id,))
            bills = cursor.fetchall()
            return jsonify(bills), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

# Change this route
@app.route('/api/bills/<int:bill_id>/pay', methods=['POST'])  # 👈 Updated URL
def mark_bill_paid(bill_id):
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE user_bills 
                SET is_paid = TRUE 
                WHERE bill_id = %s
            """, (bill_id,))
            
            connection.commit()
            return jsonify({"message": "Bill marked as paid"}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route('/api/spending-analysis/<int:user_id>', methods=['GET'])
def get_spending_analysis(user_id):
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sc.name AS category, 
                       SUM(ABS(t.amount)) AS total_spent
                FROM transactions t
                JOIN transaction_category tc ON t.transaction_id = tc.transaction_id
                JOIN spending_categories sc ON tc.category_id = sc.category_id
                WHERE t.user_id = %s AND t.amount < 0
                GROUP BY sc.name
                ORDER BY total_spent DESC
            """, (user_id,))
            
            result = cursor.fetchall()
            return jsonify(result), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()


if __name__ == "__main__":
    app.run(debug=True)