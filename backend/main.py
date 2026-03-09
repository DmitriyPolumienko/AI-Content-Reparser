from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import extract, generate

settings = get_settings()

app = FastAPI(
    title="AI Content Reparser API",
    description="Transform video transcripts into high-quality content with AI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract.router)
app.include_router(generate.router)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
