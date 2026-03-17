from typing import List, Optional

from pydantic import BaseModel


class ExtractRequest(BaseModel):
    url: str
    user_id: Optional[str] = None
    language: Optional[str] = None
    prefer_manual: bool = True


class ExtractResponse(BaseModel):
    transcript: str
    word_count: int


class GenerateRequest(BaseModel):
    transcript: str
    content_type: str  # "seo_article" | "linkedin_post" | "twitter_thread"
    keywords: List[str] = []
    user_id: str = "mock-user-123"
    # TODO(language-prompt): wire this into the generation prompt and per-language
    # rate-limiting once that feature is implemented.
    language: Optional[str] = None  # e.g. "en", "ru" – currently stored for future use


class GenerateResponse(BaseModel):
    content: str
    words_used: int
    words_remaining: int
    videos_processed: int  # global generation counter returned for UI display
