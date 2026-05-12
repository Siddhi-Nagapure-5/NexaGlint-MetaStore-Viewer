import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# This is the line that was missing! It helps the app find the 'routers' folder.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    print("All routers loaded successfully!")
except Exception as e:
    print(f"Router error: {e}")
