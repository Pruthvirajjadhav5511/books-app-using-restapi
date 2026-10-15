"""
Automated unit tests for Books REST API endpoints.
Tests:
- GET /api/books (all books, filtering, sorting)
- GET /api/books/<id> (single book & 404 handling)
- POST /api/books (creation & validation)
- PUT /api/books/<id> (updating details)
- DELETE /api/books/<id> (deletion & 404 confirmation)
- GET /api/authors (summary)
- GET /api/stats (metrics)
"""
import unittest
import json
import os
from app import app, db

class BooksApiTestCase(unittest.TestCase):
    def setUp(self):
        # Configure test client
        self.client = app.test_client()
        # Reset database to fresh seed
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DROP TABLE IF EXISTS books")
            conn.commit()
        db.init_db(seed_sample_data=True)

    def test_01_get_all_books(self):
        res = self.client.get("/api/books")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertGreaterEqual(data["count"], 10)
        first_book = data["data"][0]
        self.assertIn("id", first_book)
        self.assertIn("title", first_book)
        self.assertIn("author", first_book)

    def test_02_get_book_by_id(self):
        res = self.client.get("/api/books/1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["id"], 1)
        self.assertIn("Clean Code", data["data"]["title"])
        self.assertEqual(data["data"]["author"], "Robert C. Martin")

    def test_03_get_book_not_found(self):
        res = self.client.get("/api/books/9999")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertEqual(data["status"], "error")

    def test_04_create_book(self):
        payload = {
            "title": "Refactoring: Improving the Design of Existing Code",
            "author": "Martin Fowler",
            "genre": "Software Engineering",
            "year": 1999,
            "rating": 4.8,
            "description": "A guide to understanding principles of refactoring and code smells."
        }
        res = self.client.post("/api/books", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["title"], payload["title"])
        self.assertEqual(data["data"]["author"], payload["author"])
        new_id = data["data"]["id"]

        # Verify via GET
        get_res = self.client.get(f"/api/books/{new_id}")
        self.assertEqual(get_res.status_code, 200)

    def test_05_create_book_validation_missing_fields(self):
        # Missing title
        res1 = self.client.post("/api/books", json={"author": "Anonymous"})
        self.assertEqual(res1.status_code, 400)

        # Missing author
        res2 = self.client.post("/api/books", json={"title": "Untitled"})
        self.assertEqual(res2.status_code, 400)

    def test_06_update_book(self):
        update_payload = {
            "title": "Clean Code (Second Edition)",
            "rating": 5.0,
            "status": "Borrowed"
        }
        res = self.client.put("/api/books/1", json=update_payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["data"]["title"], "Clean Code (Second Edition)")
        self.assertEqual(data["data"]["rating"], 5.0)
        self.assertEqual(data["data"]["status"], "Borrowed")

    def test_07_delete_book(self):
        res = self.client.delete("/api/books/2")
        self.assertEqual(res.status_code, 200)

        # Confirm deleted
        get_res = self.client.get("/api/books/2")
        self.assertEqual(get_res.status_code, 404)

    def test_08_search_and_filter(self):
        # Search by author
        res = self.client.get("/api/books?q=Tolkien")
        data = res.get_json()
        self.assertEqual(len(data["data"]), 1)
        self.assertEqual(data["data"][0]["author"], "J.R.R. Tolkien")

    def test_09_get_authors_summary(self):
        res = self.client.get("/api/authors")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(data["count"], 0)

    def test_10_get_stats(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total_books", data["data"])
        self.assertIn("total_authors", data["data"])
        self.assertIn("average_rating", data["data"])

if __name__ == "__main__":
    unittest.main()
