"""Supabase database service for persisting transcripts and generated content."""

import logging
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

_supabase_client = None


def _get_client():
    """Return a lazily-initialised Supabase client, or None if not configured."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.supabase_url or not settings.supabase_key:
        logger.warning("Supabase credentials not configured – database persistence disabled.")
        return None

    try:
        from supabase import create_client  # type: ignore

        _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
        return _supabase_client
    except Exception as exc:
        logger.error("Failed to initialise Supabase client: %s", exc)
        return None


def save_transcript(
    *,
    video_url: str,
    video_id: str,
    transcript_text: str,
    word_count: int,
    language: str = "en",
    user_id: Optional[str] = None,
) -> Optional[str]:
    """
    Persist a transcript to the ``transcripts`` table.

    Returns the new row UUID on success, or ``None`` if persistence is
    disabled / the insert fails (so callers never break on DB issues).
    """
    if user_id is None:
        return None

    client = _get_client()
    if client is None:
        return None

    try:
        response = (
            client.table("transcripts")
            .insert(
                {
                    "user_id": user_id,
                    "video_url": video_url,
                    "video_id": video_id,
                    "transcript_text": transcript_text,
                    "word_count": word_count,
                    "language": language,
                }
            )
            .execute()
        )
        if response.data:
            return response.data[0].get("id")
    except Exception as exc:
        logger.error("Failed to save transcript to Supabase: %s", exc)

    return None


def save_generated_content(
    *,
    user_id: str,
    content_type: str,
    content: str,
    keywords: list,
    words_used: int,
    transcript_id: Optional[str] = None,
) -> Optional[str]:
    """
    Persist generated content to the ``generated_content`` table.

    Returns the new row UUID on success, or ``None`` on failure.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        row = {
            "user_id": user_id,
            "content_type": content_type,
            "content": content,
            "keywords": keywords,
            "words_used": words_used,
        }
        if transcript_id:
            row["transcript_id"] = transcript_id

        response = client.table("generated_content").insert(row).execute()
        if response.data:
            return response.data[0].get("id")
    except Exception as exc:
        logger.error("Failed to save generated content to Supabase: %s", exc)

    return None


def update_user_words_remaining(*, user_id: str, words_used: int) -> bool:
    """
    Atomically decrement the ``words_remaining`` counter for a user using a
    server-side PostgreSQL function to avoid race conditions.

    Returns ``True`` on success, ``False`` otherwise.
    """
    client = _get_client()
    if client is None:
        return False

    try:
        client.rpc(
            "decrement_user_words",
            {"p_user_id": user_id, "p_words_used": words_used},
        ).execute()
        return True
    except Exception as exc:
        logger.error("Failed to update user word balance: %s", exc)
        return False
