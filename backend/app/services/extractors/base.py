from abc import ABC, abstractmethod


class VideoExtractor(ABC):
    @abstractmethod
    def extract_transcript(self, url: str) -> str:
        """Extract subtitles/transcript from a video URL."""
        pass

    @abstractmethod
    def validate_url(self, url: str) -> bool:
        """Validate that the URL matches the platform format."""
        pass
