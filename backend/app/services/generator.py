import json
import logging
import time
from typing import Generator, List, Optional

from openai import OpenAI, APITimeoutError, RateLimitError, APIConnectionError, APIError

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# OpenAI client configuration
# ---------------------------------------------------------------------------
client = OpenAI(
    api_key=settings.openai_api_key,
    max_retries=3,
    timeout=120.0,
)

MODEL = settings.openai_model

# ---------------------------------------------------------------------------
# Tone of voice descriptions (injected into prompts)
# ---------------------------------------------------------------------------
TONE_DESCRIPTIONS = {
    # SEO Article tones
    "professional_expert": "strict, analytical, no slang — suitable for LinkedIn, business blogs",
    "conversational_friendly": "warm, personal, as if telling a friend — suitable for personal blogs",
    "provocative_bold": "bold, strong verbs, cuts to the truth — suitable for viral articles and X/Twitter",
    "educational_instructional": "clear, step-by-step, minimal emotion, maximum utility — suitable for guides",
    "storyteller": "focuses on personal experience, emotions, and narrative from the video",
    # LinkedIn Post tones
    "expert_insight": "analytical thought-leader perspective; data-backed, authoritative, professional",
    "personal_story": "first-person experience or case study; warm, relatable, reflective",
    "actionable_advice": "concrete, step-by-step takeaways; directive, empowering, results-focused",
    # Twitter/X Thread tones
    "punchy_bold": "short punchy sentences, strong action verbs, minimal adjectives, maximum impact",
    "controversial": "contrarian opener — 'popular opinion is wrong, here's why...'; thought-provoking",
    "data_driven": "emphasis on numbers, statistics, and specific insights extracted from the video",
    # Video Recap tones
    "concise_summary": "brief, factual, skimmable — just the essentials in plain clear language",
    "engaging_recap": "energetic, highlights the most interesting moments, invites the reader to watch",
    "educational_review": "detailed, analytical, explains why each insight matters",
}

# ---------------------------------------------------------------------------
# SEO Article system prompt (strict JSON output)
# ---------------------------------------------------------------------------
SEO_ARTICLE_SYSTEM = """You are an expert SEO content writer. Transform the provided transcript into a well-structured SEO article and return it as a single JSON object.

STRICT SEO RULES (must follow exactly):
- LANGUAGE: If the user message specifies an "Output language", write ALL content — title, meta_description, headings, paragraphs, FAQ, CTA — in that language exclusively. Otherwise, use the same language as the input transcript. Do NOT mix languages.
- H1 (title): 50–60 characters. Must contain the main keyword at the BEGINNING.
- meta_description: 140–160 characters. Must end with a CTA (call-to-action).
- Headings: minimum 3 H2 headings. If target_chars > 6000, use minimum 5 headings mixing H2 and H3. No maximum, but logically structured.
- Paragraphs: max 300 characters each. Avoid "walls of text".
- Lists: minimum one bulleted or numbered list per article.
- FAQ section at the END: exactly 3–5 Q&A pairs.
- CTA block: exactly 1–2 sentences, maximum 25 words, direct and clear, no filler phrases.
- Incorporate all required keywords naturally throughout the text.
- Tone of voice: follow the specified tone precisely.

OUTPUT FORMAT — return ONLY this JSON object, no extra text:
{
  "title": "<H1, 50-60 chars, keyword at start>",
  "meta_description": "<140-160 chars with CTA at end>",
  "sections": [
    {
      "heading_level": "H2",
      "heading": "<heading text>",
      "content": "<paragraph text, max 300 chars each paragraph, separated by newlines>",
      "list": ["<item1>", "<item2>"]
    }
  ],
  "faq": [
    {"question": "<question>", "answer": "<concise answer>"}
  ],
  "cta": "<1-2 sentences, max 25 words>",
  "keywords_used": ["<kw1>", "<kw2>"]
}

The "list" field is optional per section but at least one section must include it.
"""

# ---------------------------------------------------------------------------
# LinkedIn Post system prompt (strict JSON output)
# ---------------------------------------------------------------------------
LINKEDIN_POST_SYSTEM = """You are a professional LinkedIn content creator. Transform the provided transcript into a compelling LinkedIn post and return it as a single JSON object.

STRICT LINKEDIN RULES (must follow exactly):
- LANGUAGE: If the user message specifies an "Output language", write ALL content — hook, body, list items, CTA question, hashtags — in that language exclusively. Otherwise, use the same language as the input transcript. Do NOT mix languages.
- Hook (first line): MAXIMUM 140 characters. Must contain intrigue, a problem, or a bold statement that stops the scroll.
- Total post length: 1500–3000 characters (count all text: hook + body paragraphs + list items + cta_question + hashtags combined).
- Paragraphs: maximum 2 sentences each. Use plenty of white space for readability.
- List: include exactly ONE list of 3–7 items with emoji bullets (e.g. ✅, 🔹, 💡, 🎯, 🚀).
- Emojis: use 3–5 emojis total across the entire post. Use them ONLY as list bullet markers or to accent a single key idea. NO emoji clusters at the end of sentences.
- CTA question: an open question to the audience as its OWN separate paragraph — placed immediately before the hashtags.
- Hashtags: exactly 3 relevant hashtags at the very end.
- Naturally incorporate required keywords.
- Follow the specified tone of voice precisely.

OUTPUT FORMAT — return ONLY this JSON object, no extra text:
{
  "hook": "<opening line, max 140 chars>",
  "body": ["<paragraph 1, max 2 sentences>", "<paragraph 2, max 2 sentences>"],
  "list": {
    "style": "emoji_bullets",
    "items": ["<emoji> item 1", "<emoji> item 2", "<emoji> item 3"]
  },
  "cta_question": "<open question to audience — separate paragraph before hashtags>",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "keywords_used": ["<kw1>"]
}
"""

# ---------------------------------------------------------------------------
# Twitter Thread system prompt (strict JSON output)
# ---------------------------------------------------------------------------
TWITTER_THREAD_SYSTEM = """You are a Twitter/X content creator specializing in viral threads. Transform the provided transcript into an engaging Twitter thread and return it as a single JSON object.

STRICT TWITTER THREAD RULES (must follow exactly):
- LANGUAGE: If the user message specifies an "Output language", write ALL tweets in that language exclusively. Otherwise, use the same language as the input transcript. Do NOT mix languages.
- Tweet count: 5–10 tweets. Choose based on content depth; never pad with filler content.
- Numbering: MANDATORY. Use "1/" or "1/n" format (e.g. "1/7") at the start of EVERY tweet.
- Hook tweet (first tweet): Formula: [Result/Problem] + [Promise of value] + 🧵
  Example: "I wasted 3 years ignoring this one principle. Here's what changed everything 🧵"
- Each tweet: STRICTLY under 280 characters (including the number prefix).
- One insight per tweet. Use strong action verbs. Be specific and concrete.
- Final tweet: a concise summary + call to subscribe/follow the author.
- Naturally incorporate required keywords.
- Follow the specified tone of voice precisely.

OUTPUT FORMAT — return ONLY this JSON object, no extra text:
{
  "tweets": [
    {"num": 1, "text": "1/ <hook tweet following formula + 🧵, under 280 chars>"},
    {"num": 2, "text": "2/ <insight tweet, under 280 chars>"}
  ],
  "keywords_used": ["<kw1>"]
}

The last tweet in the array is always the final summary + CTA tweet.
"""

# ---------------------------------------------------------------------------
# Video Recap system prompt (strict JSON output)
# ---------------------------------------------------------------------------
VIDEO_RECAP_SYSTEM = """You are an expert content summarizer. Transform the provided transcript into a comprehensive, well-structured video recap and return it as a single JSON object.

STRICT VIDEO RECAP RULES (must follow exactly):
- LANGUAGE: Write ALL content — title, summary, takeaways, quotes, recommendations, hashtags — in the OUTPUT LANGUAGE specified in the user message. If no output language is specified, use the same language as the transcript. Do NOT mix languages.
- Title: 60–90 characters. Clearly conveys the video topic and hooks the reader.
- Summary: 5–8 sentences covering the full arc of the video — context, core arguments, key developments, and conclusion. Aim for 400–600 characters.
- Key takeaways: exactly 5–9 bullet points. Each 80–150 characters. Cover both high-level insights and specific, actionable details. Do NOT use English section labels; write the content in the output language.
- Memorable quotes: 2–4 direct quotes or close paraphrases from the video. Each 100–250 characters. If fewer are available, include what exists.
- Recommendations: 3–6 concrete next steps or recommendations for the viewer. Each 60–120 characters.
- Hashtags: exactly 4–6 relevant hashtags for social sharing, in the output language where applicable.
- Total output target: the combined character count of all text fields must be approximately 3,000 characters (±20%).
- Follow the specified tone of voice precisely.

OUTPUT FORMAT — return ONLY this JSON object, no extra text:
{
  "title": "<60-90 chars recap title>",
  "summary": "<5-8 sentence summary, 400-600 chars>",
  "key_takeaways": ["<takeaway 1, 80-150 chars>", "<takeaway 2>", "<takeaway 3>", "<takeaway 4>", "<takeaway 5>"],
  "quotes": ["<quote or paraphrase, 100-250 chars>", "<quote 2>"],
  "recommendations": ["<recommendation 1, 60-120 chars>", "<recommendation 2>", "<recommendation 3>"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"]
}

The "quotes" field may contain fewer items if the transcript has limited quotable content.
"""

SYSTEM_PROMPTS = {
    "seo_article": SEO_ARTICLE_SYSTEM,
    "linkedin_post": LINKEDIN_POST_SYSTEM,
    "twitter_thread": TWITTER_THREAD_SYSTEM,
    "video_recap": VIDEO_RECAP_SYSTEM,
}


# ---------------------------------------------------------------------------
# Custom exception for content validation failures
# ---------------------------------------------------------------------------

class ContentValidationError(ValueError):
    """Raised when generated content fails structural validation.

    Attributes:
        code: Machine-readable error code (e.g. "content_out_of_range").
        actual_chars: Measured value that violated the constraint.
    """

    def __init__(self, message: str, *, code: str = "content_out_of_range", actual_chars: int = 0) -> None:
        super().__init__(message)
        self.code = code
        self.actual_chars = actual_chars


# ---------------------------------------------------------------------------
# Post-generation content validators
# ---------------------------------------------------------------------------

def _compute_linkedin_text_length(data: dict) -> int:
    """Compute the approximate character count of the assembled LinkedIn post text."""
    parts: list[str] = []
    parts.append(data.get("hook", ""))
    parts.extend(data.get("body", []))
    list_data = data.get("list", {})
    if isinstance(list_data, dict):
        parts.extend(list_data.get("items", []))
    parts.append(data.get("cta_question", ""))
    parts.extend(data.get("hashtags", []))
    return sum(len(p) for p in parts)


def _validate_linkedin_content(data: dict) -> None:
    """Raise ContentValidationError if the LinkedIn post violates structural constraints."""
    length = _compute_linkedin_text_length(data)
    if length < 1500 or length > 3000:
        raise ContentValidationError(
            f"LinkedIn post text length {length} chars is outside the required range 1500–3000 chars.",
            actual_chars=length,
        )


def _validate_twitter_content(data: dict) -> None:
    """Raise ContentValidationError if the Twitter thread violates structural constraints."""
    tweets = data.get("tweets", [])
    tweet_count = len(tweets)
    if not (5 <= tweet_count <= 10):
        raise ContentValidationError(
            f"Twitter thread must contain 5–10 tweets, got {tweet_count}.",
            actual_chars=tweet_count,
        )
    for tweet in tweets:
        text = tweet.get("text", "")
        if len(text) > 280:
            raise ContentValidationError(
                f"Tweet {tweet.get('num', '?')} exceeds 280 characters ({len(text)} chars).",
                actual_chars=len(text),
            )


def _validate_video_recap_content(data: dict) -> None:
    """Raise ContentValidationError if the video recap violates structural constraints."""
    title = data.get("title", "")
    title_len = len(title)
    if title and not (55 <= title_len <= 95):
        raise ContentValidationError(
            f"Video recap title length {title_len} chars is outside the required range 55–95 chars.",
            actual_chars=title_len,
        )
    takeaways = data.get("key_takeaways", [])
    count = len(takeaways)
    if not (5 <= count <= 9):
        raise ContentValidationError(
            f"Video recap must contain 5–9 key takeaways, got {count}.",
            actual_chars=count,
        )
    quotes = data.get("quotes", [])
    quote_count = len(quotes)
    if quote_count > 4:
        raise ContentValidationError(
            f"Video recap must contain at most 4 quotes, got {quote_count}.",
            actual_chars=quote_count,
        )
    recommendations = data.get("recommendations", [])
    rec_count = len(recommendations)
    if not (3 <= rec_count <= 6):
        raise ContentValidationError(
            f"Video recap must contain 3–6 recommendations, got {rec_count}.",
            actual_chars=rec_count,
        )
    hashtags = data.get("hashtags", [])
    hashtag_count = len(hashtags)
    if not (4 <= hashtag_count <= 6):
        raise ContentValidationError(
            f"Video recap must contain 4–6 hashtags, got {hashtag_count}.",
            actual_chars=hashtag_count,
        )


def _build_user_message(
    transcript: str,
    keywords: List[str],
    tone_of_voice: Optional[str],
    target_min_chars: Optional[int],
    target_max_chars: Optional[int],
    include_source_link: bool = False,
    video_url: Optional[str] = None,
    language: Optional[str] = None,
) -> str:
    """Compose the user message with all contextual instructions."""
    parts = []

    if language:
        parts.append(
            f"Output language: {language}. Write ALL content exclusively in this language, "
            "regardless of the language of the input transcript."
        )

    tone_key = tone_of_voice or "professional_expert"
    tone_desc = TONE_DESCRIPTIONS.get(tone_key, TONE_DESCRIPTIONS["professional_expert"])
    parts.append(f"Tone of voice: {tone_key.replace('_', ' ').title()} — {tone_desc}.")

    if keywords:
        parts.append(f"Required keywords (incorporate naturally): {', '.join(keywords)}.")

    if target_min_chars and target_max_chars:
        parts.append(
            f"IMPORTANT — Target content length: {target_min_chars}–{target_max_chars} characters "
            f"(count all characters in sections + FAQ + CTA combined). "
            f"This is a hard constraint — your output MUST fall within this range."
        )

    if include_source_link and video_url:
        parts.append(
            f"Include Source Link: YES. At the end of your post or thread (final tweet / after CTA question), "
            f"add a short call-to-action sentence in the output language (the same language used for the rest of the content), "
            f"followed by this URL on its own line: {video_url}  "
            f"Only the URL itself stays in its original form — all surrounding text must be in the output language."
        )

    parts.append("Return ONLY valid JSON matching the required output format.")

    parts.append(f"\nTranscript to transform:\n\n{transcript}")
    return "\n".join(parts)


def _call_responses_api(system_prompt: str, user_message: str) -> str:
    """Call OpenAI Responses API (non-streaming) and return raw output text."""
    response = client.responses.create(
        model=MODEL,
        instructions=system_prompt,
        input=user_message,
        text={"format": {"type": "json_object"}},
    )
    return response.output_text or ""


def generate_content(
    transcript: str,
    content_type: str,
    keywords: List[str],
    language: Optional[str] = None,
    tone_of_voice: Optional[str] = None,
    target_min_chars: Optional[int] = None,
    target_max_chars: Optional[int] = None,
    include_source_link: bool = False,
    video_url: Optional[str] = None,
) -> str:
    """
    Generate formatted content from a transcript using OpenAI Responses API (gpt-5.4-nano).

    Returns:
        Generated content as a raw JSON string (validated).

    Raises:
        RuntimeError on API or validation failures.
        ValueError with .code == 'content_out_of_range' if output is outside target range.
    """
    system_prompt = SYSTEM_PROMPTS.get(content_type, SYSTEM_PROMPTS["seo_article"])
    user_message = _build_user_message(
        transcript, keywords, tone_of_voice, target_min_chars, target_max_chars,
        include_source_link, video_url, language,
    )

    try:
        t0 = time.monotonic()
        raw = _call_responses_api(system_prompt, user_message)
        duration_ms = int((time.monotonic() - t0) * 1000)
        logger.info(
            "openai responses API call succeeded",
            extra={"duration_ms": duration_ms, "model": MODEL},
        )

        # ── Server-side JSON validation with one retry ────────────────────
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("invalid JSON from model – retrying once", extra={"model": MODEL})
            retry_message = (
                user_message
                + "\n\nIMPORTANT: Your previous response was not valid JSON. "
                "Return ONLY the JSON object, no explanation, no markdown fences."
            )
            t1 = time.monotonic()
            raw = _call_responses_api(system_prompt, retry_message)
            retry_ms = int((time.monotonic() - t1) * 1000)
            logger.info(
                "openai retry call finished",
                extra={"duration_ms": retry_ms, "model": MODEL},
            )
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise RuntimeError(
                    "Content generation returned invalid JSON after retry."
                ) from exc

        # ── SEO content-length range validation ───────────────────────────
        if target_min_chars is not None and target_max_chars is not None:
            actual_len = len(raw)
            if actual_len < target_min_chars or actual_len > target_max_chars:
                raise ContentValidationError(
                    f"Generated content length {actual_len} chars is outside the "
                    f"requested range {target_min_chars}–{target_max_chars} chars.",
                    actual_chars=actual_len,
                )

        # ── LinkedIn structural validation ────────────────────────────────
        if content_type == "linkedin_post":
            _validate_linkedin_content(parsed)

        # ── Twitter structural validation ─────────────────────────────────
        if content_type == "twitter_thread":
            _validate_twitter_content(parsed)

        # ── Video Recap structural validation ─────────────────────────────
        if content_type == "video_recap":
            _validate_video_recap_content(parsed)

        return raw

    except (ValueError, RuntimeError):
        raise
    except APITimeoutError as exc:
        logger.error("openai request timed out after retries", exc_info=True)
        raise RuntimeError("Content generation timed out. Please try again.") from exc
    except RateLimitError as exc:
        logger.error("openai rate limit exceeded after retries", exc_info=True)
        raise RuntimeError("OpenAI rate limit exceeded. Please try again in a moment.") from exc
    except APIConnectionError as exc:
        logger.error("openai connection error", exc_info=True)
        raise RuntimeError("Unable to reach OpenAI API. Please try again.") from exc
    except APIError as exc:
        logger.error("openai API error: %s", exc, exc_info=True)
        raise RuntimeError(f"OpenAI API error ({exc.status_code}): {exc.message}") from exc
    except Exception as exc:
        raise RuntimeError(f"Content generation failed: {exc}") from exc


def generate_content_stream(
    transcript: str,
    content_type: str,
    keywords: List[str],
    language: Optional[str] = None,
    tone_of_voice: Optional[str] = None,
    target_min_chars: Optional[int] = None,
    target_max_chars: Optional[int] = None,
    include_source_link: bool = False,
    video_url: Optional[str] = None,
) -> Generator[str, None, None]:
    """
    Stream content generation using OpenAI Responses API (stream=True).

    Yields text deltas as they arrive from the model.

    Raises:
        RuntimeError on API failures.
    """
    system_prompt = SYSTEM_PROMPTS.get(content_type, SYSTEM_PROMPTS["seo_article"])
    user_message = _build_user_message(
        transcript, keywords, tone_of_voice, target_min_chars, target_max_chars,
        include_source_link, video_url, language,
    )

    try:
        stream = client.responses.create(
            model=MODEL,
            instructions=system_prompt,
            input=user_message,
            text={"format": {"type": "json_object"}},
            stream=True,
        )
        for event in stream:
            if event.type == "response.output_text.delta":
                yield event.delta
    except APITimeoutError as exc:
        logger.error("openai stream timed out", exc_info=True)
        raise RuntimeError("Content generation timed out. Please try again.") from exc
    except RateLimitError as exc:
        logger.error("openai stream rate limit exceeded", exc_info=True)
        raise RuntimeError("OpenAI rate limit exceeded. Please try again in a moment.") from exc
    except APIConnectionError as exc:
        logger.error("openai stream connection error", exc_info=True)
        raise RuntimeError("Unable to reach OpenAI API. Please try again.") from exc
    except APIError as exc:
        logger.error("openai stream API error: %s", exc, exc_info=True)
        raise RuntimeError(f"OpenAI API error ({exc.status_code}): {exc.message}") from exc
    except Exception as exc:
        raise RuntimeError(f"Content generation failed: {exc}") from exc
