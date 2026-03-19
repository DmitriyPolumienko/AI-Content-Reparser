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
    # Tone of voice – mandatory for all content types (defaults to professional if omitted)
    tone_of_voice: Optional[str] = "professional_expert"
    # Target character range for content length validation
    target_min_chars: Optional[int] = None
    target_max_chars: Optional[int] = None


class GenerateResponse(BaseModel):
    content: str
    # Symbol-based accounting (input_chars + output_chars)
    chars_used: int
    chars_remaining: int
    # Backward-compatible aliases (equal to chars_used / chars_remaining)
    words_used: int
    words_remaining: int
    videos_processed: int  # global generation counter returned for UI display


# ---------------------------------------------------------------------------
# Over-limit / purchase packages
# ---------------------------------------------------------------------------

SYMBOL_PACKAGES = [
    {"id": "pkg_1k",  "symbols": 1_000,  "price_usd": 0.06},
    {"id": "pkg_5k",  "symbols": 5_000,  "price_usd": 0.28},
    {"id": "pkg_15k", "symbols": 15_000, "price_usd": 0.84},
    {"id": "pkg_40k", "symbols": 40_000, "price_usd": 2.24},
]


class SymbolPackage(BaseModel):
    id: str
    symbols: int
    price_usd: float


class OverLimitDetail(BaseModel):
    code: str = "over_limit"
    message: str
    chars_remaining: int
    packages: List[SymbolPackage]
    billing_note: str = (
        "Purchased symbols are added to your subscription balance immediately. "
        "The charge will be added to your next subscription renewal invoice."
    )
