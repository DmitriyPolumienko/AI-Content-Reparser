from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models.schemas import ExtractRequest, ExtractResponse
from ..services.extractors.youtube import YouTubeExtractor

router = APIRouter(prefix="/api", tags=["extract"])
_youtube_extractor = YouTubeExtractor()


@router.post("/extract", response_model=ExtractResponse)
async def extract_subtitles(body: ExtractRequest) -> ExtractResponse:
    """Extract subtitles/transcript from a video URL.

    Currently supports YouTube URLs. Architecture is open for TikTok/Twitch
    by adding new extractors.
    """
    try:
        result = _youtube_extractor.extract(body.url)
        return ExtractResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal server error") from exc
