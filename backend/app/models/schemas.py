from typing import List, Optional

from pydantic import BaseModel, model_validator

# ---------------------------------------------------------------------------
# Tone-of-voice options per content type
# ---------------------------------------------------------------------------
VALID_TONES_BY_TYPE: dict[str, set[str]] = {
    "seo_article": {
        "professional_expert",
        "conversational_friendly",
        "provocative_bold",
        "educational_instructional",
        "storyteller",
    },
    "linkedin_post": {
        "expert_insight",
        "personal_story",
        "actionable_advice",
    },
    "twitter_thread": {
        "punchy_bold",
        "controversial",
        "data_driven",
    },
    "video_recap": {
        "concise_summary",
        "engaging_recap",
        "educational_review",
    },
}

DEFAULT_TONE_BY_TYPE: dict[str, str] = {
    "seo_article": "professional_expert",
    "linkedin_post": "expert_insight",
    "twitter_thread": "punchy_bold",
    "video_recap": "concise_summary",
}


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
    # Tone of voice – validated per content type; defaults to the first option for each type
    tone_of_voice: Optional[str] = None
    # Target character range for content length validation (SEO article only)
    target_min_chars: Optional[int] = None
    target_max_chars: Optional[int] = None
    # Include Source Link: when True, a CTA + video_url is injected into the output
    include_source_link: bool = False
    video_url: Optional[str] = None

    @model_validator(mode="after")
    def _validate_tone_and_source_link(self) -> "GenerateRequest":
        # Apply default tone for content type when not provided
        if not self.tone_of_voice:
            self.tone_of_voice = DEFAULT_TONE_BY_TYPE.get(
                self.content_type, "professional_expert"
            )

        # Validate tone against allowed values for this content type
        valid_tones = VALID_TONES_BY_TYPE.get(self.content_type)
        if valid_tones and self.tone_of_voice not in valid_tones:
            raise ValueError(
                f"tone_of_voice '{self.tone_of_voice}' is not valid for content_type "
                f"'{self.content_type}'. Valid options: {', '.join(sorted(valid_tones))}"
            )

        # Require non-empty video_url when include_source_link is enabled
        if self.include_source_link and not (self.video_url or "").strip():
            raise ValueError("video_url is required when include_source_link is true.")

        return self


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
