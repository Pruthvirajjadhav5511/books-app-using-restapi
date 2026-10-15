# 📚 BookVerse - Books & Authors REST API Application

A full-stack web application and RESTful API service built with Python, Flask, SQLite, and modern responsive Vanilla HTML/CSS/JavaScript. It enables storing, managing, and querying books with their unique IDs, author names, genres, publication years, ratings, and detailed descriptions.

---

## 🌟 Key Features

1. **Complete RESTful API**:
   - Standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
   - Querying books by ID, title, author, genre, and search keywords.
   - Comprehensive JSON responses with status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
2. **Interactive Web Application**:
   - **Catalog View**: Cards or table view with cover color themes, author tags, and live search.
   - **Authors Directory**: Overview of all registered authors and their published titles.
   - **Live REST API Explorer**: Built-in console to test endpoints live and view formatted JSON output with latency metrics.
   - **Full CRUD Management**: Add, view details, edit, and delete books via glassmorphic modal interfaces.
   - **Dark / Light Mode**: Sleek modern UI with persistent theme toggle.
3. **Pre-Seeded Database**:
   - Pre-populated SQLite database (`books.db`) with famous programming books and classic literature.

---

## 🚀 Quick Start

### 1. Launch the Application

In your terminal, navigate to this directory and run:

```bash
cd /Users/pruthvirajjadhav/test/books/restapi
python3 main.py
```

The launcher will:
- Check for an available port (default: `5050`).
- Initialize and seed the SQLite database if not already created.
- Automatically open `http://localhost:5050` in your default web browser.

Alternatively, you can run directly with Flask:
```bash
python3 app.py
```

---

## 📡 REST API Reference

Base URL: `http://localhost:5050`

### 1. List All Books
- **Endpoint**: `GET /api/books`
- **Query Parameters**:
  - `q`: Search keyword across title, author, genre, description (e.g. `?q=martin`)
  - `author`: Filter by author name (e.g. `?author=Orwell`)
  - `genre`: Filter by genre (e.g. `?genre=High Fantasy`)
  - `sort`: `id`, `title`, `author`, `year`, `rating` (default: `id`)
  - `order`: `asc` or `desc` (default: `asc`)

**Example `curl`**:
```bash
curl -X GET "http://localhost:5050/api/books?q=code"
```

**Response (`200 OK`)**:
```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": 1,
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "genre": "Software Engineering",
      "year": 2008,
      "isbn": "978-0132350884",
      "rating": 4.7,
      "pages": 464,
      "description": "A must-read guide to writing clean, maintainable, and readable code...",
      "status": "Available",
      "created_at": "2026-10-12 11:38:12"
    }
  ]
}
```

---

### 2. Get Book by ID
- **Endpoint**: `GET /api/books/<id>`

**Example `curl`**:
```bash
curl -X GET "http://localhost:5050/api/books/1"
```

---

### 3. Create a New Book
- **Endpoint**: `POST /api/books`
- **Headers**: `Content-Type: application/json`
- **Required Fields**: `title`, `author`
- **Optional Fields**: `genre`, `year`, `isbn`, `rating`, `pages`, `description`, `status`

**Example `curl`**:
```bash
curl -X POST "http://localhost:5050/api/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Rust Programming Language",
    "author": "Steve Klabnik & Carol Nichols",
    "genre": "Software Engineering",
    "year": 2018,
    "rating": 4.9,
    "pages": 560,
    "description": "The official book on Rust: an open source systems programming language.",
    "status": "Available"
  }'
```

**Response (`201 Created`)**:
```json
{
  "status": "success",
  "message": "Book 'The Rust Programming Language' successfully created with ID 11.",
  "data": {
    "id": 11,
    "title": "The Rust Programming Language",
    "author": "Steve Klabnik & Carol Nichols",
    "genre": "Software Engineering",
    ...
  }
}
```

---

### 4. Update an Existing Book
- **Endpoint**: `PUT /api/books/<id>` (or `PATCH /api/books/<id>`)
- **Headers**: `Content-Type: application/json`

**Example `curl`**:
```bash
curl -X PUT "http://localhost:5050/api/books/1" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5.0,
    "status": "Borrowed"
  }'
```

---

### 5. Delete a Book
- **Endpoint**: `DELETE /api/books/<id>`

**Example `curl`**:
```bash
curl -X DELETE "http://localhost:5050/api/books/1"
```

---

### 6. Authors Directory
- **Endpoint**: `GET /api/authors`

Returns all unique authors with total book counts and title lists.

---

### 7. Library Metrics
- **Endpoint**: `GET /api/stats`

Returns aggregated stats: total books, unique authors, genres, and average rating.

---

## 🧪 Running Automated Tests

Run the test suite to verify all REST endpoints:

```bash
python3 test_api.py
```

---

## 📂 File Structure

```text
restapi/
├── app.py              # Flask REST API server and routing
├── db.py               # SQLite database access and data schema
├── main.py             # Browser launcher and server runner
├── test_api.py         # Automated test suite (10 unit tests)
├── README.md           # Documentation and API specification
└── static/             # Frontend UI assets
    ├── index.html      # Semantic HTML layout
    ├── styles.css      # Custom styling, dark mode, animations
    └── app.js          # REST client, DOM manipulation, live tester
```
# books-app-using-restapi
