"""Supabase database service for persisting transcripts and generated content."""

import logging
from typing import Any, Dict, List, Optional

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


def get_videos_processed() -> Optional[int]:
    """
    Return the current ``videos_processed`` value from the ``app_stats`` table.

    Returns the integer value on success, or ``None`` if Supabase is not
    configured or the query fails (callers should fall back to the in-memory
    counter in that case).
    """
    client = _get_client()
    if client is None:
        return None

    try:
        response = (
            client.table("app_stats")
            .select("value")
            .eq("key", "videos_processed")
            .single()
            .execute()
        )
        if response.data:
            return int(response.data["value"])
    except Exception as exc:
        logger.error("Failed to read videos_processed from Supabase: %s", exc)

    return None


def increment_videos_processed() -> Optional[int]:
    """
    Atomically increment ``videos_processed`` in the ``app_stats`` table and
    return the new value.

    Uses the ``increment_stat`` PostgreSQL function (defined in migration 003)
    which issues ``UPDATE … SET value = value + 1 RETURNING value``.

    Returns the new integer value on success, or ``None`` if Supabase is not
    configured or the operation fails (callers should fall back to the
    in-memory counter in that case).
    """
    client = _get_client()
    if client is None:
        return None

    try:
        response = client.rpc("increment_stat", {"p_key": "videos_processed"}).execute()
        if response.data is not None:
            return int(response.data)
    except Exception as exc:
        logger.error("Failed to increment videos_processed in Supabase: %s", exc)

    return None


def save_user_generation(
    *,
    user_id: str,
    content_type: str,
    content: str,
    title: Optional[str] = None,
    video_url: Optional[str] = None,
) -> Optional[str]:
    """
    Persist a generation to the ``generation_history`` table.

    Returns the new row UUID on success, or ``None`` on failure.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        row: Dict[str, Any] = {
            "user_id": user_id,
            "content_type": content_type,
            "content": content,
        }
        if title:
            row["title"] = title
        if video_url:
            row["video_url"] = video_url

        response = client.table("generation_history").insert(row).execute()
        if response.data:
            return response.data[0].get("id")
    except Exception as exc:
        logger.error("Failed to save user generation to Supabase: %s", exc)

    return None


def list_user_generations(
    user_id: str,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Return up to ``limit`` recent generations for ``user_id``.

    Each item contains: id, content_type, title, video_url, created_at.
    Returns an empty list if Supabase is not configured or the query fails.
    """
    client = _get_client()
    if client is None:
        return []

    try:
        response = (
            client.table("generation_history")
            .select("id, content_type, title, video_url, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.error("Failed to list user generations from Supabase: %s", exc)

    return []


def get_generation_by_id(generation_id: str) -> Optional[Dict[str, Any]]:
    """
    Return a single generation row by its UUID, or ``None`` if not found / on error.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        response = (
            client.table("generation_history")
            .select("id, user_id, content_type, title, video_url, content, created_at")
            .eq("id", generation_id)
            .single()
            .execute()
        )
        return response.data or None
    except Exception as exc:
        logger.error("Failed to fetch generation %s from Supabase: %s", generation_id, exc)

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
