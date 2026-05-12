from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "NexaGlint API is Live"}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Re-import routers safely
try:
    from routers.auth import router as auth_router
    from routers.tables import router as tables_router
    app.include_router(auth_router)
    app.include_router(tables_router)
except Exception as e:
    print(f"Router error: {e}")
