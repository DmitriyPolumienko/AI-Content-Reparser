"""Stats endpoint – exposes global application metrics."""

import logging

from fastapi import APIRouter, Request

from app.logging_config import request_id_var
from app.routers.generate import get_generation_count
from app.services.database import get_videos_processed

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/stats")
def get_stats(request: Request):
    """
    Return global application statistics.

    Response:
    {
      "videos_processed": 248
    }

    Reads ``videos_processed`` from the Supabase ``app_stats`` table so the
    value persists across server restarts and is consistent across multiple
    workers.  Falls back to the in-process counter when Supabase is not
    configured or the query fails.
    """
    req_id = getattr(request.state, "request_id", request_id_var.get())

    db_count = get_videos_processed()
    count = db_count if db_count is not None else get_generation_count()

    logger.info(
        "stats fetched",
        extra={"request_id": req_id, "method": "GET", "path": "/api/stats", "status_code": 200},
    )
    return {"videos_processed": count}
