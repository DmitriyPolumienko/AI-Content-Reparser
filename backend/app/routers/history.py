"""History router — list and fetch per-user saved generations."""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.database import list_user_generations, get_generation_by_id

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/history", response_model=List[Dict[str, Any]])
def list_history(
    user_id: str = Query(..., description="User identifier"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of items to return"),
):
    """
    Return the most recent generations for a user.

    Each item contains: id, content_type, title, video_url, created_at.
    """
    items = list_user_generations(user_id, limit=limit)
    return items


@router.get("/history/{generation_id}", response_model=Dict[str, Any])
def get_history_item(generation_id: str):
    """
    Return a single saved generation by its UUID.

    Returns the full content field alongside metadata.
    """
    item = get_generation_by_id(generation_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Generation not found.")
    return item
