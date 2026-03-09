from __future__ import annotations

import re

from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

from .base import VideoExtractor


class YouTubeExtractor(VideoExtractor):
    """Extracts transcript/subtitles from a YouTube video."""

    _URL_PATTERNS = [
        r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})",
        r"shorts/([A-Za-z0-9_-]{11})",
    ]

    def _parse_video_id(self, url: str) -> str:
        for pattern in self._URL_PATTERNS:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        raise ValueError(f"Could not extract YouTube video ID from URL: {url}")

    def extract(self, url: str) -> dict:
        try:
            video_id = self._parse_video_id(url)
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

            # Prefer manually created transcripts; fall back to auto-generated.
            try:
                transcript = transcript_list.find_manually_created_transcript(
                    ["en", "ru", "uk"]
                )
            except NoTranscriptFound:
                transcript = transcript_list.find_generated_transcript(
                    ["en", "ru", "uk"]
                )

            entries = transcript.fetch()
            subtitles = " ".join(entry["text"] for entry in entries)
            return {"subtitles": subtitles, "video_id": video_id, "title": None}
        except TranscriptsDisabled:
            raise ValueError("Subtitles/transcripts are disabled for this video.")
        except NoTranscriptFound:
            raise ValueError(
                "No transcript found for this video in supported languages (en/ru/uk)."
            )
        except ValueError:
            raise
        except Exception as exc:
            raise RuntimeError(f"Failed to extract transcript: {exc}") from exc
