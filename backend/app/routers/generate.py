import logging
import threading
import time

from fastapi import APIRouter, HTTPException, Request

from app.logging_config import request_id_var
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services import balance as balance_service
from app.services.generator import generate_content

router = APIRouter()
logger = logging.getLogger(__name__)

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
def generate(request: GenerateRequest, http_request: Request):
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
    req_id = getattr(http_request.state, "request_id", request_id_var.get())
    _log_extra = {"request_id": req_id, "method": "POST", "path": "/api/generate"}
    t0 = time.monotonic()

    try:
        logger.info("generate started", extra={**_log_extra, "content_type": request.content_type})

        current_balance = balance_service.get_balance(request.user_id)
        if current_balance <= 0:
            logger.warning(
                "generate rejected: insufficient balance",
                extra={**_log_extra, "status_code": 402, "duration_ms": _ms(t0)},
            )
            raise HTTPException(
                status_code=402,
                detail="Insufficient word balance. Please top up your account.",
            )

        # ── Generate content first; deduct balance only on success ────────
        # This ensures the mock balance (and any future real balance) is never
        # deducted when OpenAI fails mid-request.
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

        logger.info(
            "generate completed",
            extra={
                **_log_extra,
                "status_code": 200,
                "duration_ms": _ms(t0),
                "words_used": words_used,
                "videos_processed": videos_processed,
            },
        )

        return GenerateResponse(
            content=content,
            words_used=words_used,
            words_remaining=words_remaining,
            videos_processed=videos_processed,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        logger.warning(
            "generate validation error",
            extra={**_log_extra, "status_code": 422, "duration_ms": _ms(t0), "error_type": "ValueError"},
            exc_info=True,
        )
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error(
            "generate runtime error",
            extra={**_log_extra, "status_code": 502, "duration_ms": _ms(t0), "error_type": "RuntimeError"},
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.error(
            "generate unexpected error",
            extra={**_log_extra, "status_code": 500, "duration_ms": _ms(t0), "error_type": type(exc).__name__},
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


def _ms(t0: float) -> int:
    """Return elapsed milliseconds since t0 (monotonic)."""
    return int((time.monotonic() - t0) * 1000)
