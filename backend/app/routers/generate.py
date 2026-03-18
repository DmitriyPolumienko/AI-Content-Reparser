import logging
import threading
import time

from fastapi import APIRouter, HTTPException, Request

from app.logging_config import request_id_var
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services import balance as balance_service
from app.services.database import increment_videos_processed as _db_increment_videos_processed
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
    Returns: { "content": "...", "chars_used": 500, "chars_remaining": 17500,
               "words_used": 500, "words_remaining": 17500,
               "videos_processed": 248 }

    TODO(language-limits): once per-language rate limiting is introduced,
    validate request.language here and enforce quotas before generation.
    """
    req_id = getattr(http_request.state, "request_id", request_id_var.get())
    _log_extra = {"request_id": req_id, "method": "POST", "path": "/api/generate"}
    t0 = time.monotonic()

    try:
        logger.info("generate started", extra={**_log_extra, "content_type": request.content_type})

        # ── Enforce per-request input limit ───────────────────────────────
        input_chars = len(request.transcript)
        plan_limits = balance_service.get_plan_limits(request.user_id)
        if input_chars > plan_limits.max_input_chars:
            logger.warning(
                "generate rejected: input exceeds plan limit",
                extra={
                    **_log_extra,
                    "status_code": 413,
                    "input_chars": input_chars,
                    "max_input_chars": plan_limits.max_input_chars,
                    "duration_ms": _ms(t0),
                },
            )
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Input too large: {input_chars:,} symbols. "
                    f"Your plan allows up to {plan_limits.max_input_chars:,} input symbols per request."
                ),
            )

        # ── Check available symbol balance ────────────────────────────────
        current_balance = balance_service.get_balance(request.user_id)
        if current_balance <= 0:
            logger.warning(
                "generate rejected: insufficient symbol balance",
                extra={**_log_extra, "status_code": 402, "duration_ms": _ms(t0)},
            )
            raise HTTPException(
                status_code=402,
                detail="Symbol limit reached. Please upgrade your plan.",
            )

        # ── Generate content first; deduct balance only on success ────────
        # This ensures the balance (and any future real balance) is never
        # deducted when OpenAI fails mid-request.
        content = generate_content(
            transcript=request.transcript,
            content_type=request.content_type,
            keywords=request.keywords,
            language=request.language,
        )

        output_chars = len(content)

        # Log a warning when LLM output exceeds the plan's per-request cap.
        # We don't reject here because we cannot control LLM output length
        # precisely; the cap is enforced via max_completion_tokens in the
        # generator.  The full cost is still charged to the user's balance.
        if output_chars > plan_limits.max_output_chars:
            logger.warning(
                "generate: output exceeded plan max_output_chars",
                extra={
                    **_log_extra,
                    "output_chars": output_chars,
                    "max_output_chars": plan_limits.max_output_chars,
                },
            )

        chars_used = input_chars + output_chars
        chars_remaining = balance_service.deduct_balance(request.user_id, chars_used)

        # Increment counter only after a successful generation.
        # Try Supabase first for persistence across restarts/workers;
        # fall back to the in-memory counter if Supabase is unavailable.
        db_count = _db_increment_videos_processed()
        if db_count is not None:
            videos_processed = db_count
            # Keep the in-memory counter in sync so /api/stats stays consistent
            # if a subsequent DB read fails.
            global _generation_count
            with _generation_count_lock:
                _generation_count = db_count
        else:
            videos_processed = _increment_generation_count()

        logger.info(
            "generate completed",
            extra={
                **_log_extra,
                "status_code": 200,
                "duration_ms": _ms(t0),
                "input_chars": input_chars,
                "output_chars": output_chars,
                "chars_used": chars_used,
                "videos_processed": videos_processed,
            },
        )

        return GenerateResponse(
            content=content,
            chars_used=chars_used,
            chars_remaining=chars_remaining,
            # Backward-compatible aliases: these fields previously represented
            # word counts, but now carry character counts.  Kept so that any
            # existing client that reads `words_remaining` continues to receive
            # a valid (character-based) quota value without breaking.
            words_used=chars_used,
            words_remaining=chars_remaining,
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
