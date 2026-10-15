"""
Database module for Books REST API.
Handles SQLite connection, schema creation, and seeding sample book data.
"""
import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "books.db")

SAMPLE_BOOKS = [
    {
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "author": "Robert C. Martin",
        "genre": "Software Engineering",
        "year": 2008,
        "isbn": "978-0132350884",
        "rating": 4.7,
        "pages": 464,
        "description": "A must-read guide to writing clean, maintainable, and readable code with practical code examples and principles.",
        "status": "Available"
    },
    {
        "title": "The Pragmatic Programmer: Your Journey To Mastery",
        "author": "Andrew Hunt & David Thomas",
        "genre": "Software Engineering",
        "year": 1999,
        "isbn": "978-0201616224",
        "rating": 4.8,
        "pages": 352,
        "description": "Timeless tips and wisdom for software craftspeople covering career development, architectural best practices, and code hygiene.",
        "status": "Available"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "genre": "Dystopian Fiction",
        "year": 1949,
        "isbn": "978-0451524935",
        "rating": 4.9,
        "pages": 328,
        "description": "A chilling dystopian tale of totalitarian surveillance, thought control, and the rebellion of Winston Smith against Big Brother.",
        "status": "Available"
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "genre": "Classic Literature",
        "year": 1960,
        "isbn": "978-0060935467",
        "rating": 4.8,
        "pages": 336,
        "description": "A profound exploration of racial injustice, empathy, and moral courage in the American South through the eyes of young Scout Finch.",
        "status": "Borrowed"
    },
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "genre": "High Fantasy",
        "year": 1937,
        "isbn": "978-0547928227",
        "rating": 4.7,
        "pages": 310,
        "description": "The enchanting journey of Bilbo Baggins as he accompanies Thorin Oakenshield and a band of dwarves to reclaim the Lonely Mountain from Smaug.",
        "status": "Available"
    },
    {
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "genre": "Non-Fiction / History",
        "year": 2011,
        "isbn": "978-0062316097",
        "rating": 4.6,
        "pages": 443,
        "description": "A sweeping narrative of human evolution, examining cognitive, agricultural, and scientific revolutions that shaped civilization.",
        "status": "Available"
    },
    {
        "title": "Dune",
        "author": "Frank Herbert",
        "genre": "Science Fiction",
        "year": 1965,
        "isbn": "978-0441172719",
        "rating": 4.7,
        "pages": 688,
        "description": "Set on the desert planet Arrakis, a masterwork of sci-fi exploring politics, religion, ecology, and the destiny of Paul Atreides.",
        "status": "Available"
    },
    {
        "title": "Atomic Habits",
        "author": "James Clear",
        "genre": "Self-Help / Psychology",
        "year": 2018,
        "isbn": "978-0735211292",
        "rating": 4.9,
        "pages": 320,
        "description": "An immensely practical framework for building good habits, breaking bad ones, and mastering the tiny behaviors that lead to remarkable results.",
        "status": "Borrowed"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "genre": "Classic Romance",
        "year": 1813,
        "isbn": "978-0141439518",
        "rating": 4.6,
        "pages": 432,
        "description": "The spirited romance between Elizabeth Bennet and the proud Mr. Darcy amidst the societal expectations of 19th-century England.",
        "status": "Available"
    },
    {
        "title": "Designing Data-Intensive Applications",
        "author": "Martin Kleppmann",
        "genre": "Distributed Systems",
        "year": 2017,
        "isbn": "978-1449373320",
        "rating": 4.9,
        "pages": 616,
        "description": "An exhaustive guide to data systems architectures, storage engines, replication, partitioning, transactions, and stream processing.",
        "status": "Available"
    }
]

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(seed_sample_data: bool = True):
    """Initializes the database table and seeds it if empty."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                genre TEXT DEFAULT 'General',
                year INTEGER,
                isbn TEXT,
                rating REAL DEFAULT 4.0,
                pages INTEGER,
                description TEXT,
                status TEXT DEFAULT 'Available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

        # Seed if empty
        cursor.execute("SELECT COUNT(*) FROM books")
        count = cursor.fetchone()[0]
        if count == 0 and seed_sample_data:
            cursor.executemany("""
                INSERT INTO books (title, author, genre, year, isbn, rating, pages, description, status)
                VALUES (:title, :author, :genre, :year, :isbn, :rating, :pages, :description, :status)
            """, SAMPLE_BOOKS)
            conn.commit()

def dict_from_row(row: sqlite3.Row) -> Dict[str, Any]:
    return dict(row)

def get_all_books(search: Optional[str] = None, author: Optional[str] = None, genre: Optional[str] = None, sort_by: str = "id", order: str = "asc") -> List[Dict[str, Any]]:
    query = "SELECT * FROM books WHERE 1=1"
    params: List[Any] = []

    if search:
        query += " AND (title LIKE ? OR author LIKE ? OR genre LIKE ? OR description LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    if author:
        query += " AND author LIKE ?"
        params.append(f"%{author}%")

    if genre:
        query += " AND genre = ?"
        params.append(genre)

    valid_sorts = {
        "id": "id",
        "title": "title",
        "author": "author",
        "year": "year",
        "rating": "rating"
    }
    col = valid_sorts.get(sort_by.lower(), "id")
    direction = "DESC" if order.lower() == "desc" else "ASC"
    query += f" ORDER BY {col} {direction}"

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict_from_row(r) for r in rows]

def get_book_by_id(book_id: int) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None

def create_book(data: Dict[str, Any]) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO books (title, author, genre, year, isbn, rating, pages, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get("title", "").strip(),
            data.get("author", "").strip(),
            data.get("genre", "General").strip() or "General",
            data.get("year"),
            data.get("isbn", "").strip(),
            data.get("rating", 4.0),
            data.get("pages"),
            data.get("description", "").strip(),
            data.get("status", "Available")
        ))
        conn.commit()
        book_id = cursor.lastrowid
        return get_book_by_id(book_id)

def update_book(book_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_book_by_id(book_id)
    if not existing:
        return None

    updated = {
        "title": data.get("title", existing["title"]).strip() if "title" in data else existing["title"],
        "author": data.get("author", existing["author"]).strip() if "author" in data else existing["author"],
        "genre": data.get("genre", existing["genre"]).strip() if "genre" in data else existing["genre"],
        "year": data.get("year", existing["year"]) if "year" in data else existing["year"],
        "isbn": data.get("isbn", existing["isbn"]).strip() if "isbn" in data else existing["isbn"],
        "rating": data.get("rating", existing["rating"]) if "rating" in data else existing["rating"],
        "pages": data.get("pages", existing["pages"]) if "pages" in data else existing["pages"],
        "description": data.get("description", existing["description"]).strip() if "description" in data else existing["description"],
        "status": data.get("status", existing["status"]) if "status" in data else existing["status"]
    }

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE books
            SET title = ?, author = ?, genre = ?, year = ?, isbn = ?, rating = ?, pages = ?, description = ?, status = ?
            WHERE id = ?
        """, (
            updated["title"],
            updated["author"],
            updated["genre"],
            updated["year"],
            updated["isbn"],
            updated["rating"],
            updated["pages"],
            updated["description"],
            updated["status"],
            book_id
        ))
        conn.commit()
        return get_book_by_id(book_id)

def delete_book(book_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
        conn.commit()
        return cursor.rowcount > 0

def get_authors_summary() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT author, COUNT(*) as book_count, GROUP_CONCAT(title, ' | ') as book_titles, AVG(rating) as avg_rating
            FROM books
            GROUP BY author
            ORDER BY book_count DESC, author ASC
        """)
        rows = cursor.fetchall()
        return [dict_from_row(r) for r in rows]

def get_stats_summary() -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM books")
        total_books = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT author) FROM books")
        total_authors = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT genre) FROM books")
        total_genres = cursor.fetchone()[0]

        cursor.execute("SELECT ROUND(AVG(rating), 2) FROM books")
        avg_rating = cursor.fetchone()[0] or 0.0

        return {
            "total_books": total_books,
            "total_authors": total_authors,
            "total_genres": total_genres,
            "average_rating": avg_rating
        }
