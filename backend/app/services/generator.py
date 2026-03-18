import logging
import time
from typing import List, Optional

from openai import OpenAI, APITimeoutError, RateLimitError, APIConnectionError, APIError

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# OpenAI client configuration
# ---------------------------------------------------------------------------
# max_retries=3: the SDK will automatically retry transient errors (rate limits,
#   connection errors) with exponential back-off (1 s, 2 s, 4 s).
# timeout=60.0: each individual HTTP call to OpenAI is capped at 60 seconds
#   to prevent the request handler from hanging indefinitely.
# ---------------------------------------------------------------------------
client = OpenAI(
    api_key=settings.openai_api_key,
    max_retries=3,
    timeout=60.0,
)

SYSTEM_PROMPTS = {
    "seo_article": (
        "You are an expert SEO content writer. "
        "Transform the provided transcript into a well-structured SEO article. "
        "Include an engaging title (H1), clear headings (H2/H3), an introduction, "
        "body sections with relevant information, and a conclusion. "
        "Naturally incorporate the required keywords throughout the text. "
        "Write in a clear, authoritative tone suitable for a professional blog."
    ),
    "linkedin_post": (
        "You are a professional LinkedIn content creator. "
        "Transform the provided transcript into a compelling LinkedIn post. "
        "Start with a powerful hook, use short paragraphs, include a call-to-action, "
        "and end with 3-5 relevant hashtags. "
        "Naturally incorporate the required keywords. "
        "Keep the tone professional yet conversational."
    ),
    "twitter_thread": (
        "You are a Twitter/X content creator specializing in viral threads. "
        "Transform the provided transcript into an engaging Twitter thread. "
        "Number each tweet (1/, 2/, etc.), start with a hook tweet, "
        "keep each tweet under 280 characters, and end with a strong CTA tweet. "
        "Naturally incorporate the required keywords."
    ),
}


def generate_content(
    transcript: str,
    content_type: str,
    keywords: List[str],
    language: Optional[str] = None,  # noqa: ARG001 – reserved for future language-aware prompts
) -> str:
    """
    Generate formatted content from a transcript using OpenAI GPT-4.1.

    Args:
        transcript: Raw transcript text.
        content_type: One of 'seo_article', 'linkedin_post', 'twitter_thread'.
        keywords: List of required keywords to include.
        language: Source language code (e.g. 'en', 'ru').
            Currently unused in the prompt.
            TODO(language-prompt): use this to customise the system prompt or
            output language once per-language restrictions are introduced.

    Returns:
        Generated content as a string.
    """
    try:
        system_prompt = SYSTEM_PROMPTS.get(content_type, SYSTEM_PROMPTS["seo_article"])

        keyword_instruction = ""
        if keywords:
            keyword_instruction = (
                f"\n\nRequired keywords to incorporate naturally: {', '.join(keywords)}."
            )

        user_message = (
            f"Here is the transcript to transform:{keyword_instruction}\n\n{transcript}"
        )

        t0 = time.monotonic()
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
        )
        duration_ms = int((time.monotonic() - t0) * 1000)
        logger.info("openai call succeeded", extra={"duration_ms": duration_ms, "model": "gpt-4.1"})

        content = response.choices[0].message.content or ""
        return content

    except APITimeoutError as exc:
        # The SDK has already retried max_retries times; surface a 504-class error.
        logger.error("openai request timed out after retries", exc_info=True)
        raise RuntimeError("Content generation timed out. Please try again.") from exc
    except RateLimitError as exc:
        # SDK retried; still hitting rate limits → surface a 429-class error.
        logger.error("openai rate limit exceeded after retries", exc_info=True)
        raise RuntimeError("OpenAI rate limit exceeded. Please try again in a moment.") from exc
    except APIConnectionError as exc:
        logger.error("openai connection error", exc_info=True)
        raise RuntimeError("Unable to reach OpenAI API. Please try again.") from exc
    except APIError as exc:
        # Catches all other OpenAI HTTP errors (4xx/5xx from the OpenAI side).
        logger.error("openai API error: %s", exc, exc_info=True)
        raise RuntimeError(f"OpenAI API error ({exc.status_code}): {exc.message}") from exc
    except Exception as exc:
        raise RuntimeError(f"Content generation failed: {exc}") from exc
