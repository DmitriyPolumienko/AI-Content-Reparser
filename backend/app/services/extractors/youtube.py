import re
import os
import random
import logging
from urllib.parse import urlparse

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
from youtube_transcript_api.proxies import GenericProxyConfig

from app.services.extractors.base import VideoExtractor

logger = logging.getLogger(__name__)


class YouTubeExtractor(VideoExtractor):
    """Extracts transcripts from YouTube videos using youtube-transcript-api with proxy support."""

    _URL_PATTERN = re.compile(
        r"(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})"
    )

    MAX_PROXY_RETRIES = 3

    def __init__(self):
        proxy_string = os.getenv("WEBSHARE_PROXY_LIST", "")
        self.proxy_list = self._parse_proxies(proxy_string)

        if self.proxy_list:
            logger.info("Loaded %d proxies for YouTube requests", len(self.proxy_list))
        else:
            logger.warning("No proxies configured. YouTube may block requests from cloud IPs.")

    def _parse_proxies(self, proxy_string: str) -> list:
        """
        Parse proxy list from format: IP:PORT:USERNAME:PASSWORD
        Returns list of proxy URLs in format: http://USERNAME:PASSWORD@IP:PORT
        """
        if not proxy_string:
            return []

        proxies = []
        for line in proxy_string.split(","):
            parts = line.strip().split(":")
            if len(parts) == 4:
                ip, port, username, password = parts
                proxy_url = f"http://{username}:{password}@{ip}:{port}"
                proxies.append(proxy_url)
            else:
                logger.warning("Invalid proxy format: %s", line.strip())

        return proxies

    def _get_proxy_config(self) -> GenericProxyConfig | None:
        """Returns a GenericProxyConfig built from a randomly selected proxy."""
        if not self.proxy_list:
            return None

        proxy_url = random.choice(self.proxy_list)
        # Log only the host:port portion, not the credentials
        parsed = urlparse(proxy_url)
        proxy_host = parsed.hostname or "unknown"
        proxy_port = parsed.port
        proxy_ip = f"{proxy_host}:{proxy_port}" if proxy_port else proxy_host
        logger.info("Using proxy: %s", proxy_ip)

        return GenericProxyConfig(http_url=proxy_url, https_url=proxy_url)

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
        """
        Extract transcript from YouTube video.
        Uses proxy rotation with retry logic if proxies are configured.
        """
        video_id = self._extract_video_id(url)

        max_attempts = self.MAX_PROXY_RETRIES if self.proxy_list else 1
        last_exception: Exception | None = None

        for attempt in range(max_attempts):
            try:
                # A new instance is created per attempt so each attempt can use a different proxy
                proxy_config = self._get_proxy_config()
                ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
                transcript = ytt_api.fetch(video_id, languages=["en", "ru"])
                text = " ".join(snippet.text for snippet in transcript)
                logger.info("Successfully extracted transcript for %s (attempt %d)", video_id, attempt + 1)
                return text

            except TranscriptsDisabled:
                raise ValueError("Transcripts are disabled for this video.")

            except NoTranscriptFound:
                raise ValueError("No transcript found for this video in English or Russian.")

            except Exception as exc:
                last_exception = exc
                logger.warning("Attempt %d failed: %s", attempt + 1, exc)

        error_msg = f"Failed to extract transcript after {max_attempts} attempt(s)."
        if self.proxy_list:
            error_msg += " All proxies failed. YouTube may be blocking these IPs."
        else:
            error_msg += " No proxies configured. YouTube is likely blocking your server IP."

        raise RuntimeError(f"{error_msg} Last error: {last_exception}") from last_exception
