from __future__ import annotations

from openai import OpenAI

from ..config import get_settings

_CONTENT_TYPE_PROMPTS: dict[str, str] = {
    "seo_article": (
        "You are an expert SEO content writer. Transform the provided video transcript "
        "into a well-structured, long-form SEO article. Include a compelling H1 title, "
        "several H2 subheadings, naturally integrated keywords, and a conclusion with a CTA. "
        "Make it engaging, informative, and optimised for search engines."
    ),
    "linkedin": (
        "You are an expert LinkedIn content creator. Transform the provided video transcript "
        "into a compelling LinkedIn post. It should be professional yet conversational, "
        "include a strong hook, key takeaways as bullet points, and end with a thought-provoking "
        "question or call-to-action. Optimal length: 1300–2000 characters."
    ),
    "twitter": (
        "You are an expert Twitter/X content creator. Transform the provided video transcript "
        "into an engaging Twitter thread. Start with a strong hook tweet, then write 5–8 numbered "
        "follow-up tweets covering the main points. End with a call-to-action tweet. "
        "Each tweet must be under 280 characters."
    ),
}


def generate_content(
    subtitles: str,
    content_type: str,
    keywords: list[str],
) -> str:
    """Generate formatted content from video subtitles using GPT-4.1.

    Args:
        subtitles: Raw transcript text from the video.
        content_type: One of 'seo_article', 'linkedin', 'twitter'.
        keywords: List of mandatory keywords to include in the output.

    Returns:
        Generated content as a string.

    Raises:
        ValueError: For unsupported content types.
        RuntimeError: On OpenAI API errors.
    """
    settings = get_settings()
    system_prompt = _CONTENT_TYPE_PROMPTS.get(content_type)
    if system_prompt is None:
        raise ValueError(
            f"Unsupported content type '{content_type}'. "
            f"Choose from: {list(_CONTENT_TYPE_PROMPTS.keys())}"
        )

    keywords_instruction = (
        f"\n\nMANDATORY: You MUST naturally incorporate the following keywords into the content: "
        f"{', '.join(keywords)}."
        if keywords
        else ""
    )

    user_message = (
        f"Here is the video transcript:\n\n{subtitles}{keywords_instruction}\n\n"
        "Now generate the content as instructed."
    )

    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        raise RuntimeError(f"OpenAI generation failed: {exc}") from exc
