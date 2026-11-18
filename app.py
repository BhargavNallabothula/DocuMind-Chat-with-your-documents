from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from controller.chat_controller import chat_router
from controller.files_controller import file_router

app = FastAPI(title="DocuMind API")

# CORS is useful while developing the React app with Vite on port 5173.
# In the production-style setup, the frontend is served from this same origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(file_router)

FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"


@app.get("/health")
def health():
    return {"status": "ok", "frontend_built": FRONTEND_DIST.is_dir()}


if FRONTEND_DIST.is_dir():
    # Keep this mount AFTER API routers so /chat, /files and /docs keep working.
    # html=True serves frontend/dist/index.html for the site root.
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
else:
    @app.get("/")
    def frontend_not_built():
        return JSONResponse(
            status_code=503,
            content={
                "message": "Frontend build not found. Run 'npm install' and 'npm run build' inside the frontend folder.",
                "api_docs": "/docs",
            },
        )
