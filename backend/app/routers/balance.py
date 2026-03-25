"""Balance endpoint – returns the user's current symbol balance."""

import logging

from fastapi import APIRouter, HTTPException, Request

from app.logging_config import request_id_var
from app.services import balance as balance_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/balance")
def get_balance(user_id: str, request: Request):
    """
    Return the user's current symbol balance.

    Query params:
      user_id: the authenticated user's UUID

    Response:
    {
      "chars_remaining": 17500
    }
    """
    req_id = getattr(request.state, "request_id", request_id_var.get())

    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id is required.")

    try:
        chars_remaining = balance_service.get_balance(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error(
            "balance fetch error",
            extra={"request_id": req_id, "user_id": user_id},
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail="Failed to fetch balance.")

    logger.info(
        "balance fetched",
        extra={
            "request_id": req_id,
            "method": "GET",
            "path": "/api/balance",
            "status_code": 200,
            "chars_remaining": chars_remaining,
        },
    )
    return {"chars_remaining": chars_remaining}
