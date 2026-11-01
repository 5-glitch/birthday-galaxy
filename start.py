"""Run with: python start.py (no third-party packages needed)."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parent / 'public'
    server = ThreadingHTTPServer(('127.0.0.1', 8000), partial(SimpleHTTPRequestHandler, directory=str(root)))
    print('Birthday page: http://localhost:8000  |  Press Ctrl+C to stop.')
    webbrowser.open('http://localhost:8000')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
