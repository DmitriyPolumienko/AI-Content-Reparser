"""Stats endpoint – exposes global application metrics."""

from fastapi import APIRouter

from app.routers.generate import get_generation_count

router = APIRouter()


@router.get("/stats")
def get_stats():
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
    return {"videos_processed": get_generation_count()}
