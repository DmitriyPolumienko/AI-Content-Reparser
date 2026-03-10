import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import extract, generate

app = FastAPI(
    title="AI Content Reparser API",
    description="Convert YouTube videos into SEO-optimized content using AI.",
    version="1.0.0",
)

# Parse ALLOWED_ORIGINS from environment variable (comma-separated)
# Falls back to localhost for development
origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract.router, prefix="/api")
app.include_router(generate.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Content Reparser API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
