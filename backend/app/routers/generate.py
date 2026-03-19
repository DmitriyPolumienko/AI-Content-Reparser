import json
import logging
import threading
import time
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.logging_config import request_id_var
from app.models.schemas import (
    GenerateRequest,
    GenerateResponse,
    OverLimitDetail,
    SYMBOL_PACKAGES,
    SymbolPackage,
)
from app.services import balance as balance_service
from app.services.database import increment_videos_processed as _db_increment_videos_processed
from app.services.generator import generate_content, generate_content_stream

router = APIRouter()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-process generation counter.
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


def _over_limit_detail(user_id: str) -> OverLimitDetail:
    """Build an OverLimitDetail payload with current balance and available packages."""
    try:
        chars_remaining = balance_service.get_balance(user_id)
    except ValueError:
        chars_remaining = 0
    return OverLimitDetail(
        code="over_limit",
        message="Symbol limit reached. Purchase a symbol package to continue.",
        chars_remaining=chars_remaining,
        packages=[SymbolPackage(**p) for p in SYMBOL_PACKAGES],
    )


@router.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest, http_request: Request):
    """
    Generate formatted content from a transcript (non-streaming).

    Accepts:
    {
      "transcript": "...",
      "content_type": "seo_article",
      "keywords": ["keyword1"],
      "user_id": "mock-user-123",
      "language": "en",
      "tone_of_voice": "professional_expert",
      "target_min_chars": 3000,
      "target_max_chars": 5000
    }
    Returns: { "content": "...", "chars_used": 500, "chars_remaining": 17500, ... }
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
            detail = _over_limit_detail(request.user_id)
            raise HTTPException(status_code=402, detail=detail.model_dump())

        # ── Generate content ───────────────────────────────────────────────
        content = generate_content(
            transcript=request.transcript,
            content_type=request.content_type,
            keywords=request.keywords,
            language=request.language,
            tone_of_voice=request.tone_of_voice,
            target_min_chars=request.target_min_chars,
            target_max_chars=request.target_max_chars,
        )

        output_chars = len(content)

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

        db_count = _db_increment_videos_processed()
        if db_count is not None:
            videos_processed = db_count
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
            words_used=chars_used,
            words_remaining=chars_remaining,
            videos_processed=videos_processed,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        code = getattr(exc, "code", None)
        if code == "content_out_of_range":
            logger.warning(
                "generate content_out_of_range",
                extra={**_log_extra, "status_code": 422, "duration_ms": _ms(t0)},
            )
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "content_out_of_range",
                    "message": str(exc),
                    "actual_chars": getattr(exc, "actual_chars", None),
                },
            )
        logger.warning(
            "generate validation error",
            extra={**_log_extra, "status_code": 422, "duration_ms": _ms(t0)},
            exc_info=True,
        )
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error(
            "generate runtime error",
            extra={**_log_extra, "status_code": 502, "duration_ms": _ms(t0)},
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.error(
            "generate unexpected error",
            extra={**_log_extra, "status_code": 500, "duration_ms": _ms(t0)},
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


@router.post("/generate/stream")
async def generate_stream(request: GenerateRequest, http_request: Request):
    """
    Generate content from a transcript and stream the output as SSE.

    Events:
      data: {"type": "start"}
      data: {"type": "delta", "text": "..."}
      data: {"type": "end", "chars_remaining": N, "videos_processed": N}
      data: {"type": "error", "code": "...", "message": "...", "packages": [...]}
    """
    req_id = getattr(http_request.state, "request_id", request_id_var.get())
    _log_extra = {"request_id": req_id, "method": "POST", "path": "/api/generate/stream"}

    async def event_stream() -> AsyncGenerator[str, None]:
        # ── Pre-flight checks ──────────────────────────────────────────────
        try:
            plan_limits = balance_service.get_plan_limits(request.user_id)
        except ValueError as exc:
            yield _sse({"type": "error", "code": "user_not_found", "message": str(exc)})
            return

        input_chars = len(request.transcript)
        if input_chars > plan_limits.max_input_chars:
            yield _sse({
                "type": "error",
                "code": "input_too_large",
                "message": (
                    f"Input too large: {input_chars:,} symbols. "
                    f"Your plan allows up to {plan_limits.max_input_chars:,} input symbols."
                ),
            })
            return

        current_balance = balance_service.get_balance(request.user_id)
        if current_balance <= 0:
            detail = _over_limit_detail(request.user_id)
            yield _sse({
                "type": "error",
                **detail.model_dump(),
            })
            return

        # ── Stream content ─────────────────────────────────────────────────
        yield _sse({"type": "start"})
        accumulated = []
        try:
            for delta in generate_content_stream(
                transcript=request.transcript,
                content_type=request.content_type,
                keywords=request.keywords,
                language=request.language,
                tone_of_voice=request.tone_of_voice,
                target_min_chars=request.target_min_chars,
                target_max_chars=request.target_max_chars,
            ):
                accumulated.append(delta)
                yield _sse({"type": "delta", "text": delta})
        except RuntimeError as exc:
            yield _sse({"type": "error", "code": "generation_failed", "message": str(exc)})
            return

        # ── Post-stream accounting ─────────────────────────────────────────
        full_content = "".join(accumulated)
        output_chars = len(full_content)
        chars_used = input_chars + output_chars

        try:
            chars_remaining = balance_service.deduct_balance(request.user_id, chars_used)
        except ValueError:
            chars_remaining = 0

        db_count = _db_increment_videos_processed()
        if db_count is not None:
            videos_processed = db_count
            global _generation_count
            with _generation_count_lock:
                _generation_count = db_count
        else:
            videos_processed = _increment_generation_count()

        logger.info(
            "generate/stream completed",
            extra={
                **_log_extra,
                "input_chars": input_chars,
                "output_chars": output_chars,
                "videos_processed": videos_processed,
            },
        )

        yield _sse({
            "type": "end",
            "chars_remaining": chars_remaining,
            "videos_processed": videos_processed,
        })

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


def _sse(data: dict) -> str:
    """Format a dict as an SSE data line."""
    return f"data: {json.dumps(data)}\n\n"


def _ms(t0: float) -> int:
    """Return elapsed milliseconds since t0 (monotonic)."""
    return int((time.monotonic() - t0) * 1000)
