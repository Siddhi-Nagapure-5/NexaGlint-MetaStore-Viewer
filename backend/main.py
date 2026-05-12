import os
import sys
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Ensure local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexaglint")

app = FastAPI(title="NexaGlint API")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Debug Middleware ─────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"[DEBUG] {request.method} {request.url.path}")
    return await call_next(request)

# ─── Basic Endpoints ──────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "online", "message": "NexaGlint API is Live"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

# ─── Routers ──────────────────────────────────────────────────────────────────
try:
    from routers.auth import router as auth_router
    from routers.tables import router as tables_router
    app.include_router(auth_router)
    app.include_router(tables_router)
    logger.info("Successfully loaded all routers")
except Exception as e:
    logger.error(f"Failed to load routers: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
