from __future__ import annotations

from pydantic import BaseModel


class ExtractRequest(BaseModel):
    url: str


class ExtractResponse(BaseModel):
    subtitles: str
    video_id: str
    title: str | None = None


class GenerateRequest(BaseModel):
    subtitles: str
    content_type: str  # "seo_article" | "linkedin" | "twitter"
    keywords: list[str] = []
    user_id: str | None = None


class GenerateResponse(BaseModel):
    content: str
    words_used: int
    tokens_left: int
