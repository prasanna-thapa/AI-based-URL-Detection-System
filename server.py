from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.main import app as api_app
import os

app = FastAPI()
app.mount("/api", api_app)
BUILD_DIR = "frontend/build"

if os.path.isdir(BUILD_DIR):
    app.mount("/static", StaticFiles(directory=os.path.join(BUILD_DIR, "static")), name="static")

@app.get("/")
def serve_react_app():
    return FileResponse(os.path.join(BUILD_DIR, "index.html"))

@app.get("/{full_path:path}")
def serve_react_any(full_path: str):
    return FileResponse(os.path.join(BUILD_DIR, "index.html"))
