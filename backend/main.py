import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers.auth import router as auth_router
from routers.tables import router as tables_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NexaGlint API")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health / Root ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "online", "message": "NexaGlint API is Live", "docs": "/api/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(tables_router)
