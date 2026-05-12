import sys
import os

# Add the current directory to sys.path to ensure local modules are found
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.tables import router as tables_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s — %(message)s",
)

app = FastAPI(
    title="NexaGlint API",
    description="Metastore viewer for Parquet, Iceberg, Delta & Hudi tables on S3",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)


# ─── CORS ─────────────────────────────────────────────────────────────────────
# Using a highly permissive CORS policy to ensure Vercel can connect to Render.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(tables_router)


@app.get("/")
def root():
    return {"status": "online", "message": "NexaGlint API is Live", "docs": "/api/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "NexaGlint API", "version": "1.0.0"}
