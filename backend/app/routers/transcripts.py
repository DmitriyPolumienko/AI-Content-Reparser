from fastapi import APIRouter, HTTPException, Query, Request

from app.limiter import limiter
from app.services.extractors.youtube import YouTubeExtractor

router = APIRouter()

_youtube_extractor = YouTubeExtractor()


@router.get("/transcripts/list")
@limiter.limit("20/minute")
async def list_transcripts(request: Request, url: str = Query(..., description="YouTube video URL")):
    """
    Get list of available transcripts for a YouTube video.
    Does not download transcript text — only returns metadata.
    """
    try:
        url = url.strip()

        if not _youtube_extractor.validate_url(url):
            raise HTTPException(status_code=400, detail="Unsupported or invalid URL.")

        video_id = _youtube_extractor.get_video_id(url)
        available = _youtube_extractor.list_transcripts(url)

        return {
            "video_id": video_id,
            "video_url": url,
            "available_transcripts": available,
        }

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")
