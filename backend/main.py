from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import extract, generate

app = FastAPI(
    title="AI Content Reparser API",
    description="Convert YouTube videos into SEO-optimized content using AI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract.router, prefix="/api")
app.include_router(generate.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Content Reparser API is running"}
