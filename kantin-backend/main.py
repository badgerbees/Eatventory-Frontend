"""Run the FastAPI app with: python main.py

This launches Uvicorn programmatically so you can start the server with a single python command.
"""
import os
import sys

# Ensure package imports work when running from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

if __name__ == "__main__":
    import uvicorn

    # host/port configurable via env
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run("main:app", host=host, port=port, reload=True)
