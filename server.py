from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.main import app as api_app

app = FastAPI()

# Mount backend API under /api
app.mount("/api", api_app)

# Serve frontend build
app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

@app.get("/")
def root():
    return FileResponse("frontend/dist/index.html")
