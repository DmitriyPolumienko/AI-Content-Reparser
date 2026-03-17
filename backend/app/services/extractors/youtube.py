import re

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

from app.services.extractors.base import VideoExtractor


class YouTubeExtractor(VideoExtractor):
    """Extracts transcripts from YouTube videos using youtube-transcript-api."""

    _URL_PATTERN = re.compile(
        r"(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})"
    )

    def validate_url(self, url: str) -> bool:
        return bool(self._URL_PATTERN.search(url))

    def _extract_video_id(self, url: str) -> str:
        match = self._URL_PATTERN.search(url)
        if not match:
            raise ValueError(f"Cannot extract video ID from URL: {url}")
        return match.group(1)

    def get_video_id(self, url: str) -> str:
        """Public method to extract the YouTube video ID from a URL."""
        return self._extract_video_id(url)

    def extract_transcript(self, url: str) -> str:
        try:
            video_id = self._extract_video_id(url)
            ytt_api = YouTubeTranscriptApi()
            transcript = ytt_api.fetch(video_id, languages=["en", "ru"])
            text = " ".join(snippet.text for snippet in transcript)
            return text
        except TranscriptsDisabled:
            raise ValueError("Transcripts are disabled for this video.")
        except NoTranscriptFound:
            raise ValueError("No transcript found for this video in English or Russian.")
        except Exception as exc:
            raise RuntimeError(f"Failed to extract transcript: {exc}") from exc
