import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import extract, generate

app = FastAPI(
    title="V2Post API",
    description="Convert YouTube videos into SEO-optimized content using AI.",
    version="1.0.0",
)

# CORS: read allowed origins from env, fallback to localhost for dev
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

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
    return {"status": "ok", "message": "V2Post API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
