"""
Books REST API Flask Application
Exposes clean RESTful endpoints for managing books and authors,
along with serving the interactive web application.
"""
import os
import sys
from flask import Flask, request, jsonify, send_from_directory
import db

app = Flask(__name__, static_folder="static")

# Initialize database on startup
db.init_db()

# -------------------------------------------------------------
# FRONTEND ROUTE
# -------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# -------------------------------------------------------------
# REST API ENDPOINTS
# -------------------------------------------------------------

@app.route("/api/books", methods=["GET"])
def list_books():
    """
    GET /api/books
    Query params:
      - q: General search query across title, author, genre, description
      - author: Filter by author name
      - genre: Filter by genre
      - sort: Sort column (id, title, author, year, rating)
      - order: Sort direction (asc, desc)
    """
    search_query = request.args.get("q")
    author = request.args.get("author")
    genre = request.args.get("genre")
    sort_by = request.args.get("sort", "id")
    order = request.args.get("order", "asc")

    books = db.get_all_books(
        search=search_query,
        author=author,
        genre=genre,
        sort_by=sort_by,
        order=order
    )
    return jsonify({
        "status": "success",
        "count": len(books),
        "data": books
    }), 200

@app.route("/api/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    """
    GET /api/books/<id>
    Fetches a single book by ID.
    """
    book = db.get_book_by_id(book_id)
    if not book:
        return jsonify({
            "status": "error",
            "message": f"Book with ID {book_id} not found."
        }), 404

    return jsonify({
        "status": "success",
        "data": book
    }), 200

@app.route("/api/books", methods=["POST"])
def create_book():
    """
    POST /api/books
    Creates a new book.
    Required JSON fields:
      - title: string
      - author: string
    Optional JSON fields:
      - genre, year, isbn, rating, pages, description, status
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "status": "error",
            "message": "Invalid or missing JSON payload."
        }), 400

    title = data.get("title", "").strip() if isinstance(data.get("title"), str) else ""
    author = data.get("author", "").strip() if isinstance(data.get("author"), str) else ""

    if not title:
        return jsonify({
            "status": "error",
            "message": "Field 'title' is required and cannot be empty."
        }), 400

    if not author:
        return jsonify({
            "status": "error",
            "message": "Field 'author' is required and cannot be empty."
        }), 400

    # Validate rating if provided
    rating = data.get("rating", 4.0)
    try:
        rating = float(rating)
        if not (0.0 <= rating <= 5.0):
            return jsonify({"status": "error", "message": "Rating must be between 0.0 and 5.0"}), 400
    except (ValueError, TypeError):
        rating = 4.0

    # Validate year if provided
    year = data.get("year")
    if year:
        try:
            year = int(year)
        except (ValueError, TypeError):
            year = None

    # Validate pages if provided
    pages = data.get("pages")
    if pages:
        try:
            pages = int(pages)
        except (ValueError, TypeError):
            pages = None

    book_payload = {
        "title": title,
        "author": author,
        "genre": data.get("genre", "General"),
        "year": year,
        "isbn": data.get("isbn", ""),
        "rating": rating,
        "pages": pages,
        "description": data.get("description", ""),
        "status": data.get("status", "Available")
    }

    created = db.create_book(book_payload)
    return jsonify({
        "status": "success",
        "message": f"Book '{title}' successfully created with ID {created['id']}.",
        "data": created
    }), 201

@app.route("/api/books/<int:book_id>", methods=["PUT", "PATCH"])
def update_book(book_id):
    """
    PUT /api/books/<id>
    Updates an existing book.
    """
    existing = db.get_book_by_id(book_id)
    if not existing:
        return jsonify({
            "status": "error",
            "message": f"Book with ID {book_id} not found."
        }), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "status": "error",
            "message": "Invalid or missing JSON payload."
        }), 400

    if "title" in data and not str(data["title"]).strip():
        return jsonify({"status": "error", "message": "Field 'title' cannot be empty."}), 400

    if "author" in data and not str(data["author"]).strip():
        return jsonify({"status": "error", "message": "Field 'author' cannot be empty."}), 400

    updated = db.update_book(book_id, data)
    return jsonify({
        "status": "success",
        "message": f"Book with ID {book_id} updated successfully.",
        "data": updated
    }), 200

@app.route("/api/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    """
    DELETE /api/books/<id>
    Deletes a book by ID.
    """
    existing = db.get_book_by_id(book_id)
    if not existing:
        return jsonify({
            "status": "error",
            "message": f"Book with ID {book_id} not found."
        }), 404

    success = db.delete_book(book_id)
    if success:
        return jsonify({
            "status": "success",
            "message": f"Book '{existing['title']}' (ID: {book_id}) was successfully deleted."
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Could not delete book."
        }), 500

@app.route("/api/authors", methods=["GET"])
def list_authors():
    """
    GET /api/authors
    Returns distinct authors and their authored book counts.
    """
    authors = db.get_authors_summary()
    return jsonify({
        "status": "success",
        "count": len(authors),
        "data": authors
    }), 200

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """
    GET /api/stats
    Returns library summary statistics.
    """
    stats = db.get_stats_summary()
    return jsonify({
        "status": "success",
        "data": stats
    }), 200

@app.route("/api/reset", methods=["POST"])
def reset_database():
    """
    POST /api/reset
    Resets the database with initial sample books.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS books")
        conn.commit()
    db.init_db(seed_sample_data=True)
    return jsonify({
        "status": "success",
        "message": "Database reset to sample books."
    }), 200

# Error Handlers
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"status": "error", "message": "API endpoint not found."}), 404
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(500)
def server_error(e):
    return jsonify({"status": "error", "message": "Internal server error."}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"Starting Books REST API Server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
