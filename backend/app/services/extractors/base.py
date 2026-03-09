from __future__ import annotations

from abc import ABC, abstractmethod


class VideoExtractor(ABC):
    """Abstract base class for video transcript extractors.

    New platforms (TikTok, Twitch, Kick) can be added by subclassing this
    and implementing the ``extract`` method.
    """

    @abstractmethod
    def extract(self, url: str) -> dict:
        """Extract transcript data from a video URL.

        Args:
            url: The URL of the video to extract transcripts from.

        Returns:
            A dict with at least ``subtitles`` (str) and ``video_id`` (str).
        """
