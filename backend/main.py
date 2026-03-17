import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.limiter import limiter
from app.routers import extract, generate, transcripts, stats

app = FastAPI(
    title="V2Post API",
    description="Convert YouTube videos into SEO-optimized content using AI.",
    version="1.0.0",
)

# Attach limiter to app state so slowapi middleware can discover it
app.state.limiter = limiter

# Register the default 429 handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# SlowAPI middleware must be added before CORS so it runs on every request
app.add_middleware(SlowAPIMiddleware)

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
app.include_router(transcripts.router, prefix="/api", tags=["transcripts"])
app.include_router(stats.router, prefix="/api", tags=["stats"])


@app.get("/")
def root():
    return {"status": "ok", "message": "V2Post API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
