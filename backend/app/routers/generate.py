from fastapi import APIRouter, HTTPException

from app.models.schemas import GenerateRequest, GenerateResponse
from app.services import balance as balance_service
from app.services.generator import generate_content

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    """
    Generate formatted content from a transcript.

    Accepts:
    {
      "transcript": "...",
      "content_type": "seo_article",
      "keywords": ["keyword1", "keyword2"],
      "user_id": "mock-user-123"
    }
    Returns: { "content": "...", "words_used": 500, "words_remaining": 9500 }
    """
    try:
        current_balance = balance_service.get_balance(request.user_id)
        if current_balance <= 0:
            raise HTTPException(
                status_code=402,
                detail="Insufficient word balance. Please top up your account.",
            )

        content = generate_content(
            transcript=request.transcript,
            content_type=request.content_type,
            keywords=request.keywords,
        )

        words_used = len(content.split())
        words_remaining = balance_service.deduct_balance(request.user_id, words_used)

        return GenerateResponse(
            content=content,
            words_used=words_used,
            words_remaining=words_remaining,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")
