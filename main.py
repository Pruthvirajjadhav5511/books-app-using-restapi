"""
Books REST API Application Launcher
Launches the Flask server and opens the web application in your default browser.
"""
import os
import sys
import socket
import webbrowser
import threading
import time
from app import app, db

DEFAULT_PORT = 5050

def is_port_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("0.0.0.0", port))
            return True
        except OSError:
            return False

def find_available_port(start_port: int = DEFAULT_PORT) -> int:
    port = start_port
    while port < 6000:
        if is_port_available(port):
            return port
        port += 1
    return DEFAULT_PORT

def open_browser(url: str):
    time.sleep(1.0)
    print(f"Opening browser at {url}...")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

if __name__ == "__main__":
    # Ensure database is initialized
    db.init_db()

    port = int(os.environ.get("PORT", find_available_port(DEFAULT_PORT)))
    url = f"http://localhost:{port}"

    print("=" * 65)
    print(" 📚 BookVerse - Books & Authors Management REST API")
    print("=" * 65)
    print(f"  • Web UI:          {url}")
    print(f"  • REST API Books:  {url}/api/books")
    print(f"  • REST API Authors:{url}/api/authors")
    print(f"  • Library Stats:   {url}/api/stats")
    print("=" * 65)
    print("Press CTRL+C to stop the server.\n")

    # Open browser in a separate background thread
    threading.Thread(target=open_browser, args=(url,), daemon=True).start()

    # Start Flask server
    app.run(host="0.0.0.0", port=port, debug=False)
