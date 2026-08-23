"""
FastAPI application entry point for the SkillForge Matching Service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, match
from app.config import get_settings
from app.database import connect_db, disconnect_db

settings = get_settings()

app = FastAPI(
    title="SkillForge Matching Service",
    description="AI-powered semantic job-freelancer matching using NLP embeddings",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="")
app.include_router(match.router, prefix="/match", tags=["Matching"])
