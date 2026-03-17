from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

from app.limiter import limiter
from app.models.schemas import ExtractRequest, ExtractResponse
from app.services.cache import TranscriptCache
from app.services.extractors.youtube import YouTubeExtractor
from app.services import database

router = APIRouter()

_youtube_extractor = YouTubeExtractor()
_cache = TranscriptCache()


@router.post("/extract", response_model=ExtractResponse)
@limiter.limit("10/minute")
def extract_transcript(request: ExtractRequest, background_tasks: BackgroundTasks, req: Request):
    """
    Extract the transcript from a YouTube video URL.

    Accepts: { "url": "https://youtube.com/watch?v=..." }
    Returns: { "transcript": "...", "word_count": 1234 }

    Cache flow:
      1. Check Supabase cache by video_id → return instantly on HIT.
      2. On MISS: extract via YouTube (with rotating proxy).
      3. Save to cache + DB in the background (non-blocking).
    """
    try:
        url = request.url.strip()

        if not _youtube_extractor.validate_url(url):
            raise HTTPException(status_code=400, detail="Unsupported or invalid URL.")

        video_id = _youtube_extractor.get_video_id(url)

        # --- Cache lookup ---------------------------------------------------
        cached = _cache.get(video_id)
        if cached:
            transcript = cached.get("transcript_text", "")
            return ExtractResponse(transcript=transcript, word_count=len(transcript.split()))

        # --- Cache miss: extract via YouTube --------------------------------
        transcript = _youtube_extractor.extract_transcript(url)
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
            user_id=request.user_id,
        )

        return ExtractResponse(transcript=transcript, word_count=word_count)

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")
