from typing import List

from openai import OpenAI

from app.config import settings

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPTS = {
    "seo_article": (
        "You are an expert SEO content writer. "
        "Transform the provided transcript into a well-structured SEO article. "
        "Include an engaging title (H1), clear headings (H2/H3), an introduction, "
        "body sections with relevant information, and a conclusion. "
        "Naturally incorporate the required keywords throughout the text. "
        "Write in a clear, authoritative tone suitable for a professional blog."
    ),
    "linkedin_post": (
        "You are a professional LinkedIn content creator. "
        "Transform the provided transcript into a compelling LinkedIn post. "
        "Start with a powerful hook, use short paragraphs, include a call-to-action, "
        "and end with 3-5 relevant hashtags. "
        "Naturally incorporate the required keywords. "
        "Keep the tone professional yet conversational."
    ),
    "twitter_thread": (
        "You are a Twitter/X content creator specializing in viral threads. "
        "Transform the provided transcript into an engaging Twitter thread. "
        "Number each tweet (1/, 2/, etc.), start with a hook tweet, "
        "keep each tweet under 280 characters, and end with a strong CTA tweet. "
        "Naturally incorporate the required keywords."
    ),
}


def generate_content(
    transcript: str,
    content_type: str,
    keywords: List[str],
) -> str:
    """
    Generate formatted content from a transcript using OpenAI GPT-4.1.

    Args:
        transcript: Raw transcript text.
        content_type: One of 'seo_article', 'linkedin_post', 'twitter_thread'.
        keywords: List of required keywords to include.

    Returns:
        Generated content as a string.
    """
    try:
        system_prompt = SYSTEM_PROMPTS.get(content_type, SYSTEM_PROMPTS["seo_article"])

        keyword_instruction = ""
        if keywords:
            keyword_instruction = (
                f"\n\nRequired keywords to incorporate naturally: {', '.join(keywords)}."
            )

        user_message = (
            f"Here is the transcript to transform:{keyword_instruction}\n\n{transcript}"
        )

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content or ""
        return content
    except Exception as exc:
        raise RuntimeError(f"Content generation failed: {exc}") from exc
