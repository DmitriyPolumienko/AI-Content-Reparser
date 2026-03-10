import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import extract, generate

app = FastAPI(
    title="AI Content Reparser API",
    description="Convert YouTube videos into SEO-optimized content using AI.",
    version="1.0.0",
)

# CORS: read allowed origins from env, fallback to localhost for dev
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# Optional regex for matching dynamic preview URLs (e.g. Vercel)
# Default matches any *.vercel.app origin
_origin_regex = os.getenv("ALLOWED_ORIGINS_REGEX", r"https://.*\.vercel\.app$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=_origin_regex,
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
