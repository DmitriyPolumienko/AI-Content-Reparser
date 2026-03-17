from fastapi import APIRouter, HTTPException
import threading

from app.models.schemas import GenerateRequest, GenerateResponse
from app.services import balance as balance_service
from app.services.generator import generate_content

router = APIRouter()

# ---------------------------------------------------------------------------
# In-process generation counter.
#
# Starts at 247 to match the value already shown in the UI.
# Persists for the lifetime of the process; resets on server restart.
# NOTE: If multi-process/multi-worker deployments are needed, migrate this
# counter to a dedicated Supabase table (e.g. app_stats.videos_processed).
# ---------------------------------------------------------------------------
_generation_count: int = 247
_generation_count_lock = threading.Lock()


def _increment_generation_count() -> int:
    """Thread-safe increment; returns the updated count."""
    global _generation_count
    with _generation_count_lock:
        _generation_count += 1
        return _generation_count


def get_generation_count() -> int:
    """Return the current generation count (thread-safe read)."""
    with _generation_count_lock:
        return _generation_count


@router.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    """
    Generate formatted content from a transcript.

    Accepts:
    {
      "transcript": "...",
      "content_type": "seo_article",
      "keywords": ["keyword1", "keyword2"],
      "user_id": "mock-user-123",
      "language": "en"   // optional – reserved for future language-based limits
    }
    Returns: { "content": "...", "words_used": 500, "words_remaining": 9500,
               "videos_processed": 248 }

    TODO(language-limits): once per-language rate limiting is introduced,
    validate request.language here and enforce quotas before generation.
    """
    try:
        current_balance = balance_service.get_balance(request.user_id)
        if current_balance <= 0:
            raise HTTPException(
                status_code=402,
                detail="Insufficient word balance. Please top up your account.",
            )

        content = generate_content(
            transcript=request.transcript,
            content_type=request.content_type,
            keywords=request.keywords,
            language=request.language,
        )

        words_used = len(content.split())
        words_remaining = balance_service.deduct_balance(request.user_id, words_used)

        # Increment counter only after a successful generation
        videos_processed = _increment_generation_count()

        return GenerateResponse(
            content=content,
            words_used=words_used,
            words_remaining=words_remaining,
            videos_processed=videos_processed,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")
