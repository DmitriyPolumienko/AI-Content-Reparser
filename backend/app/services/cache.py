"""
Transcript caching backed by the Supabase ``transcripts`` table.

Cache flow:
  Request → TranscriptCache.get(video_id) → HIT?  return instantly (<50 ms)
                                           → MISS? extract via YouTube → TranscriptCache.set(...)
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class TranscriptCache:
    """Read/write transcript cache stored in Supabase."""

    TABLE = "transcripts"

    def get(self, video_id: str) -> Optional[dict]:
        """
        Look up a cached transcript by video ID.

        Returns a dict with at least ``transcript`` and ``language`` keys on a
        cache hit, or ``None`` on a cache miss / error.
        """
        try:
            from app.services.database import _get_client  # local import to avoid circular deps

            client = _get_client()
            if client is None:
                return None
            response = (
                client.table(self.TABLE)
                .select("transcript_text, language, video_url")
                .eq("video_id", video_id)
                .limit(1)
                .execute()
            )
            data = response.data
            if data:
                logger.info("Cache HIT for video_id=%s", video_id)
                return data[0]
            logger.info("Cache MISS for video_id=%s", video_id)
            return None
        except Exception as exc:  # never crash the request on cache errors
            logger.warning("Cache lookup failed for video_id=%s: %s", video_id, exc)
            return None

    def set(
        self,
        video_id: str,
        video_url: str,
        transcript: str,
        language: str = "en",
    ) -> None:
        """
        Persist a transcript to the cache table.

        Uses an upsert so that re-processing the same video simply refreshes
        the stored data instead of creating a duplicate row.
        """
        try:
            from app.services.database import _get_client  # local import to avoid circular deps

            client = _get_client()
            if client is None:
                return
            client.table(self.TABLE).upsert(
                {
                    "video_id": video_id,
                    "video_url": video_url,
                    "transcript_text": transcript,
                    "language": language,
                },
                on_conflict="video_id",
            ).execute()
            logger.info("Cache SET for video_id=%s", video_id)
        except Exception as exc:
            logger.warning("Cache write failed for video_id=%s: %s", video_id, exc)
