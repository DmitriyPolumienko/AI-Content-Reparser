from fastapi import APIRouter, HTTPException

from app.models.schemas import ExtractRequest, ExtractResponse
from app.services.extractors.youtube import YouTubeExtractor
from app.services import database

router = APIRouter()

_youtube_extractor = YouTubeExtractor()


@router.post("/extract", response_model=ExtractResponse)
def extract_transcript(request: ExtractRequest):
    """
    Extract the transcript from a YouTube video URL.

    Accepts: { "url": "https://youtube.com/watch?v=..." }
    Returns: { "transcript": "...", "word_count": 1234 }
    """
    try:
        url = request.url.strip()

        if _youtube_extractor.validate_url(url):
            transcript = _youtube_extractor.extract_transcript(url)
        else:
            raise HTTPException(status_code=400, detail="Unsupported or invalid URL.")

        word_count = len(transcript.split())
        video_id = _youtube_extractor.get_video_id(url)

        # Persist transcript to Supabase (best-effort; never blocks the response)
        database.save_transcript(
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
