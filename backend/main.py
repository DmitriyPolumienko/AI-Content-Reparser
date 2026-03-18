import os
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.limiter import limiter
from app.logging_config import setup_logging, request_id_var
from app.routers import extract, generate, transcripts, stats

# Initialise JSON structured logging as early as possible
setup_logging()

app = FastAPI(
    title="V2Post API",
    description="Convert YouTube videos into SEO-optimized content using AI.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Request-ID middleware
# ---------------------------------------------------------------------------
# Reads X-Request-ID from incoming headers (or generates a UUID v4 if absent),
# stores it in a ContextVar so all log lines within the request carry the same
# correlation ID, and echoes the value back in the response header.
# ---------------------------------------------------------------------------

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request_id_var.set(request_id)
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# Attach limiter to app state so slowapi middleware can discover it
app.state.limiter = limiter

# Register the default 429 handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# RequestIdMiddleware must run before SlowAPI so request_id is set for all logs
app.add_middleware(RequestIdMiddleware)

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
