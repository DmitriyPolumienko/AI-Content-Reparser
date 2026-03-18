import logging
import time

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

from app.limiter import limiter
from app.logging_config import request_id_var
from app.models.schemas import ExtractRequest, ExtractResponse
from app.services.cache import TranscriptCache
from app.services.extractors.youtube import YouTubeExtractor
from app.services import database

router = APIRouter()
logger = logging.getLogger(__name__)

_youtube_extractor = YouTubeExtractor()
_cache = TranscriptCache()


@router.post("/extract", response_model=ExtractResponse)
@limiter.limit("10/minute")
def extract_transcript(extract_request: ExtractRequest, request: Request, background_tasks: BackgroundTasks):
    """
    Extract the transcript from a YouTube video URL.

    Accepts: { "url": "https://youtube.com/watch?v=..." }
    Returns: { "transcript": "...", "word_count": 1234 }

    Cache flow:
      1. Check Supabase cache by video_id → return instantly on HIT.
      2. On MISS: extract via YouTube (with rotating proxy).
      3. Save to cache + DB in the background (non-blocking).
    """
    req_id = getattr(request.state, "request_id", request_id_var.get())
    _log_extra = {"request_id": req_id, "method": "POST", "path": "/api/extract"}
    t0 = time.monotonic()

    try:
        url = extract_request.url.strip()

        logger.info("extract started", extra={**_log_extra, "url": url})

        if not _youtube_extractor.validate_url(url):
            logger.warning(
                "extract rejected: invalid URL",
                extra={**_log_extra, "status_code": 400, "duration_ms": _ms(t0)},
            )
            raise HTTPException(status_code=400, detail="Unsupported or invalid URL.")

        video_id = _youtube_extractor.get_video_id(url)

        # --- Cache lookup ---------------------------------------------------
        cached = _cache.get(video_id)
        if cached:
            transcript = cached.get("transcript_text", "")
            logger.info(
                "extract completed (cache hit)",
                extra={**_log_extra, "status_code": 200, "duration_ms": _ms(t0), "cache": "hit"},
            )
            return ExtractResponse(transcript=transcript, word_count=len(transcript.split()))

        # --- Cache miss: extract via YouTube --------------------------------
        transcript = _youtube_extractor.extract_transcript(
            url,
            language=extract_request.language,
            prefer_manual=extract_request.prefer_manual,
        )
        word_count = len(transcript.split())

        # --- Persist to cache + DB in background (non-blocking) -------------
        background_tasks.add_task(
            _cache.set,
            video_id=video_id,
            video_url=url,
            transcript=transcript,
        )
        background_tasks.add_task(
            database.save_transcript,
            video_url=url,
            video_id=video_id,
            transcript_text=transcript,
            word_count=word_count,
            user_id=extract_request.user_id,
        )

        logger.info(
            "extract completed",
            extra={**_log_extra, "status_code": 200, "duration_ms": _ms(t0), "cache": "miss"},
        )
        return ExtractResponse(transcript=transcript, word_count=word_count)

    except HTTPException:
        raise
    except ValueError as exc:
        logger.warning(
            "extract validation error",
            extra={**_log_extra, "status_code": 422, "duration_ms": _ms(t0), "error_type": "ValueError"},
            exc_info=True,
        )
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error(
            "extract runtime error",
            extra={**_log_extra, "status_code": 502, "duration_ms": _ms(t0), "error_type": "RuntimeError"},
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.error(
            "extract unexpected error",
            extra={**_log_extra, "status_code": 500, "duration_ms": _ms(t0), "error_type": type(exc).__name__},
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


def _ms(t0: float) -> int:
    """Return elapsed milliseconds since t0 (monotonic)."""
    return int((time.monotonic() - t0) * 1000)
