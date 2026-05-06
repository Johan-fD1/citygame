#!/usr/bin/env python3
"""Simple static file server for development with configurable port."""
import http.server
import socketserver
import argparse
import os


def serve(port: int, bind: str = ""):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer((bind, port), handler) as httpd:
        print(f"Serving HTTP on {bind or '0.0.0.0'} port {port} (http://localhost:{port}/) ...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nShutting down server')
            httpd.shutdown() 


def main():
    parser = argparse.ArgumentParser(description='Run a simple static HTTP server for citygame')
    parser.add_argument('-p', '--port', type=int, default=int(os.environ.get('PORT', 8000)), help='Port to serve on (default: 8000 or $PORT)')
    parser.add_argument('-b', '--bind', default='', help='Bind address (default: all interfaces)')
    args = parser.parse_args()
    serve(args.port, args.bind)


if __name__ == '__main__':
    main()
