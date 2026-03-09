from typing import List, Optional

from pydantic import BaseModel


class ExtractRequest(BaseModel):
    url: str


class ExtractResponse(BaseModel):
    transcript: str
    word_count: int


class GenerateRequest(BaseModel):
    transcript: str
    content_type: str  # "seo_article" | "linkedin_post" | "twitter_thread"
    keywords: List[str] = []
    user_id: str = "mock-user-123"


class GenerateResponse(BaseModel):
    content: str
    words_used: int
    words_remaining: int
