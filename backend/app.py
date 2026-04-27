from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
app = Flask(__name__)
CORS(app)

DB_NAME = "app.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# ✅ INIT DATABASE (AUTO CREATE TABLE)
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return jsonify({"message": "Flask + DB alive ✅"})

@app.route("/hello")
def hello():
    return jsonify({
        "status": "ok",
        "message": "Hello from Flask backend 👋"
    })

@app.route("/time")
def time():
    return jsonify({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })


# ✅ POST → SIMPAN DALAM DB
@app.route("/", methods=["POST"])
def post_name():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Empty request"}), 400

    name = data.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not isinstance(name, str) or len(name.strip()) < 3:
        return jsonify({"error": "Invalid name"}), 400

    
    conn = get_db() 
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO users (name, created_at) VALUES (?, ?)",
        (name.strip(), datetime.now().isoformat())
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": f"Hello {name}, Flask received ✅"
    })


 # ✅ GET → AMBIL SEMUA DATA
@app.route("/users")
def get_users():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users ORDER BY id DESC")
    rows = cursor.fetchall()

    conn.close()

    users = [dict(row) for row in rows]

    return jsonify(users)

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

    return jsonify({
        "message": "User deleted "
    })

@app.route("/users/<int:user_id>", methods = ["PUT"])
def update_user(user_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Empty request"}), 400
    name = data.get("name")

    if not name or not isinstance(name, str) or len(name.strip()) < 2:
        return jsonify({"error": "Invalid name"}), 400
    
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE users SET name = ? WHERE id = ?",
        (name.strip(), user_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": " User updated "
    })
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port)