import logging
import time

from fastapi import APIRouter, HTTPException, Query, Request

from app.limiter import limiter
from app.logging_config import request_id_var
from app.services.extractors.youtube import YouTubeExtractor

router = APIRouter()
logger = logging.getLogger(__name__)

_youtube_extractor = YouTubeExtractor()


@router.get("/transcripts/list")
@limiter.limit("20/minute")
async def list_transcripts(request: Request, url: str = Query(..., description="YouTube video URL")):
    """
    Get list of available transcripts for a YouTube video.
    Does not download transcript text — only returns metadata.
    """
    req_id = getattr(request.state, "request_id", request_id_var.get())
    _log_extra = {"request_id": req_id, "method": "GET", "path": "/api/transcripts/list"}
    t0 = time.monotonic()

    try:
        url = url.strip()

        logger.info("transcripts/list started", extra={**_log_extra, "url": url})

        if not _youtube_extractor.validate_url(url):
            logger.warning(
                "transcripts/list rejected: invalid URL",
                extra={**_log_extra, "status_code": 400, "duration_ms": _ms(t0)},
            )
            raise HTTPException(status_code=400, detail="Unsupported or invalid URL.")

        video_id = _youtube_extractor.get_video_id(url)
        available = _youtube_extractor.list_transcripts(url)

        logger.info(
            "transcripts/list completed",
            extra={
                **_log_extra,
                "status_code": 200,
                "duration_ms": _ms(t0),
                "transcript_count": len(available),
            },
        )

        return {
            "video_id": video_id,
            "video_url": url,
            "available_transcripts": available,
        }

    except HTTPException:
        raise
    except ValueError as exc:
        logger.warning(
            "transcripts/list not found",
            extra={**_log_extra, "status_code": 404, "duration_ms": _ms(t0), "error_type": "ValueError"},
            exc_info=True,
        )
        raise HTTPException(status_code=404, detail=str(exc))
    except RuntimeError as exc:
        logger.error(
            "transcripts/list runtime error",
            extra={**_log_extra, "status_code": 502, "duration_ms": _ms(t0), "error_type": "RuntimeError"},
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.error(
            "transcripts/list unexpected error",
            extra={**_log_extra, "status_code": 500, "duration_ms": _ms(t0), "error_type": type(exc).__name__},
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


def _ms(t0: float) -> int:
    """Return elapsed milliseconds since t0 (monotonic)."""
    return int((time.monotonic() - t0) * 1000)
