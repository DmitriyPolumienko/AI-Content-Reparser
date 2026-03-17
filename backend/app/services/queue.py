"""
Redis Queue setup for background transcript extraction jobs.

Usage:
    from app.services.queue import enqueue_transcript_extraction

    job = enqueue_transcript_extraction(video_url="https://youtube.com/watch?v=xxx")
"""
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy Redis / RQ initialisation
# ---------------------------------------------------------------------------

_redis_conn = None
_transcript_queue = None


def _get_redis():
    """Return a lazily-initialised Redis connection, or ``None`` if not configured."""
    global _redis_conn
    if _redis_conn is not None:
        return _redis_conn

    redis_url = os.getenv("REDIS_URL", "")
    if not redis_url:
        logger.warning("REDIS_URL not set – Redis queue disabled.")
        return None

    try:
        from redis import Redis  # type: ignore

        _redis_conn = Redis.from_url(redis_url, decode_responses=False)
        _redis_conn.ping()
        logger.info("Redis connection established.")
        return _redis_conn
    except Exception as exc:
        logger.error("Failed to connect to Redis: %s", exc)
        return None


def _get_queue():
    """Return the ``transcripts`` RQ queue, or ``None`` if Redis is unavailable."""
    global _transcript_queue
    if _transcript_queue is not None:
        return _transcript_queue

    conn = _get_redis()
    if conn is None:
        return None

    try:
        from rq import Queue  # type: ignore

        _transcript_queue = Queue("transcripts", connection=conn, default_timeout=300)
        return _transcript_queue
    except Exception as exc:
        logger.error("Failed to create RQ queue: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Background job (module-level so RQ workers can import and execute it)
# ---------------------------------------------------------------------------


def _extract_and_cache(url: str, user_id: Optional[str]) -> str:
    """
    Background job: extract a YouTube transcript, save to cache and database.

    This is a module-level function so that RQ workers can import and pickle it
    correctly without re-creating a new function object on every enqueue call.
    """
    from app.services.extractors.youtube import YouTubeExtractor
    from app.services.cache import TranscriptCache
    from app.services import database

    extractor = YouTubeExtractor()
    transcript = extractor.extract_transcript(url)
    video_id = extractor.get_video_id(url)

    TranscriptCache().set(
        video_id=video_id,
        video_url=url,
        transcript=transcript,
    )
    database.save_transcript(
        video_url=url,
        video_id=video_id,
        transcript_text=transcript,
        word_count=len(transcript.split()),
        user_id=user_id,
    )
    return transcript


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def enqueue_transcript_extraction(
    *,
    video_url: str,
    user_id: Optional[str] = None,
) -> Optional[str]:
    """
    Add a transcript-extraction job to the Redis queue.

    Returns the RQ job ID on success, or ``None`` if the queue is unavailable
    (e.g. Redis not configured) so callers can gracefully fall back to
    synchronous processing.
    """
    queue = _get_queue()
    if queue is None:
        return None

    try:
        job = queue.enqueue(_extract_and_cache, video_url, user_id)
        logger.info("Enqueued transcript extraction job %s for %s", job.id, video_url)
        return job.id
    except Exception as exc:
        logger.error("Failed to enqueue job: %s", exc)
        return None
