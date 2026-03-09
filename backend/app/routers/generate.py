from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models.schemas import GenerateRequest, GenerateResponse
from ..services.generator import generate_content
from ..services.balance import get_balance, deduct_balance

router = APIRouter(prefix="/api", tags=["generate"])

_ANONYMOUS_USER_ID = "anonymous"


@router.post("/generate", response_model=GenerateResponse)
async def generate(body: GenerateRequest) -> GenerateResponse:
    """Generate formatted content from video subtitles.

    Checks and deducts from the user's word-token balance before generation.
    """
    user_id = body.user_id or _ANONYMOUS_USER_ID

    try:
        content = generate_content(
            subtitles=body.subtitles,
            content_type=body.content_type,
            keywords=body.keywords,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal server error") from exc

    words_used = len(content.split())

    try:
        tokens_left = deduct_balance(user_id, words_used)
    except ValueError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc

    return GenerateResponse(
        content=content,
        words_used=words_used,
        tokens_left=tokens_left,
    )
