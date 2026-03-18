"""Stats endpoint – exposes global application metrics."""

import logging

from fastapi import APIRouter, Request

from app.logging_config import request_id_var
from app.routers.generate import get_generation_count

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

    The ``videos_processed`` counter is an in-process counter that starts at 247
    (the initial seed value) and increments on every successful POST /api/generate.
    It resets on server restart.  Migrate to a Supabase ``app_stats`` table when
    persistence across deployments is required.
    """
    req_id = getattr(request.state, "request_id", request_id_var.get())
    count = get_generation_count()
    logger.info(
        "stats fetched",
        extra={"request_id": req_id, "method": "GET", "path": "/api/stats", "status_code": 200},
    )
    return {"videos_processed": count}
