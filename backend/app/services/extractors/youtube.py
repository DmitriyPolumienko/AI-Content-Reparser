import re
import os
import random
import logging

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

from app.services.extractors.base import VideoExtractor

logger = logging.getLogger(__name__)


class YouTubeExtractor(VideoExtractor):
    """Extracts transcripts from YouTube videos using youtube-transcript-api with proxy support."""

    _URL_PATTERN = re.compile(
        r"(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})"
    )

    MAX_PROXY_RETRIES = 3

    def __init__(self):
        # Rotating proxy configuration (Webshare dynamic session IDs)
        self.proxy_host = os.getenv("WEBSHARE_PROXY_HOST", "")
        self.proxy_port = os.getenv("WEBSHARE_PROXY_PORT", "80")
        self.proxy_username = os.getenv("WEBSHARE_PROXY_USERNAME", "")
        self.proxy_password = os.getenv("WEBSHARE_PROXY_PASSWORD", "")
        self.max_session_id = int(os.getenv("WEBSHARE_MAX_SESSION_ID", "215084"))

        # Fall back to legacy static proxy list if rotating proxy not configured
        self._legacy_proxy_list: list[str] = []
        if not self._rotating_proxy_configured():
            proxy_string = os.getenv("WEBSHARE_PROXY_LIST", "")
            self._legacy_proxy_list = self._parse_proxies(proxy_string)
            if self._legacy_proxy_list:
                logger.info("Loaded %d static proxies for YouTube requests", len(self._legacy_proxy_list))
            else:
                logger.warning("No proxies configured. YouTube may block requests from cloud IPs.")
        else:
            logger.info(
                "Rotating proxy configured: %s:%s (up to %d sessions)",
                self.proxy_host,
                self.proxy_port,
                self.max_session_id,
            )

    def _rotating_proxy_configured(self) -> bool:
        """Return True if the Webshare rotating proxy environment variables are set."""
        return bool(self.proxy_host and self.proxy_username and self.proxy_password)

    def _get_random_proxy(self) -> str:
        """
        Generate a rotating proxy URL with a random Webshare session ID.

        Webshare provides up to ``WEBSHARE_MAX_SESSION_ID`` unique sticky sessions
        in the format ``<username>-<session_id>:<password>@<host>:<port>``.
        """
        session_id = random.randint(1, self.max_session_id)
        username = f"{self.proxy_username}-{session_id}"
        proxy_url = f"http://{username}:{self.proxy_password}@{self.proxy_host}:{self.proxy_port}"
        logger.info("Using rotating proxy session ID: %d", session_id)
        return proxy_url

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

    def _get_proxy_dict(self) -> dict | None:
        """Returns proxy configuration as a dict for youtube-transcript-api static methods."""
        if self._rotating_proxy_configured():
            proxy_url = self._get_random_proxy()
            return {"http": proxy_url, "https": proxy_url}

        if self._legacy_proxy_list:
            proxy_url = random.choice(self._legacy_proxy_list)
            logger.info("Using static proxy from list")
            return {"http": proxy_url, "https": proxy_url}

        return None

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

    def list_transcripts(self, url: str) -> list:
        """
        List available transcripts for a YouTube video without downloading them.

        Returns a list of dicts with keys: language_code, language_name, is_generated, is_translatable.
        Manual transcripts are listed before auto-generated ones.
        """
        video_id = self._extract_video_id(url)

        proxy_active = self._rotating_proxy_configured() or bool(self._legacy_proxy_list)
        max_attempts = self.MAX_PROXY_RETRIES if proxy_active else 1
        last_exception: Exception | None = None

        for attempt in range(max_attempts):
            try:
                proxies = self._get_proxy_dict()
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, proxies=proxies)

                available = []
                for t in transcript_list:
                    if not t.is_generated:
                        available.append({
                            "language_code": t.language_code,
                            "language_name": t.language,
                            "is_generated": False,
                            "is_translatable": t.is_translatable,
                        })
                for t in transcript_list:
                    if t.is_generated:
                        available.append({
                            "language_code": t.language_code,
                            "language_name": f"{t.language} (auto-generated)",
                            "is_generated": True,
                            "is_translatable": t.is_translatable,
                        })

                logger.info("Listed %d transcripts for %s", len(available), video_id)
                return available

            except TranscriptsDisabled:
                raise ValueError("Transcripts are disabled for this video.")

            except Exception as exc:
                last_exception = exc
                logger.warning("List attempt %d failed: %s", attempt + 1, exc)

        error_msg = f"Failed to list transcripts after {max_attempts} attempt(s)."
        if proxy_active:
            error_msg += " All proxies failed. YouTube may be blocking these IPs."
        else:
            error_msg += " No proxies configured. YouTube is likely blocking your server IP."

        raise RuntimeError(f"{error_msg} Last error: {last_exception}") from last_exception

    def extract_transcript(
        self,
        url: str,
        language: str | None = None,
        prefer_manual: bool = True,
    ) -> str:
        """
        Extract transcript from YouTube video.
        Uses proxy rotation with retry logic if proxies are configured.

        Args:
            url: YouTube video URL.
            language: YouTube language code (e.g. "en", "ru"). If None, falls back to
                      ["en", "ru"] in order of preference.
            prefer_manual: When True, prefer manual transcripts over auto-generated ones.
        """
        video_id = self._extract_video_id(url)

        proxy_active = self._rotating_proxy_configured() or bool(self._legacy_proxy_list)
        max_attempts = self.MAX_PROXY_RETRIES if proxy_active else 1
        last_exception: Exception | None = None

        for attempt in range(max_attempts):
            try:
                # A fresh proxy dict is obtained per attempt to allow proxy rotation
                proxies = self._get_proxy_dict()
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, proxies=proxies)

                lang_candidates = [language] if language else ["en", "ru"]

                text = self._fetch_best_transcript(transcript_list, lang_candidates, prefer_manual)
                logger.info("Successfully extracted transcript for %s (attempt %d)", video_id, attempt + 1)
                return text

            except TranscriptsDisabled:
                raise ValueError("Transcripts are disabled for this video.")

            except (NoTranscriptFound, ValueError) as exc:
                raise ValueError(str(exc))

            except Exception as exc:
                last_exception = exc
                logger.warning("Attempt %d failed: %s", attempt + 1, exc)

        error_msg = f"Failed to extract transcript after {max_attempts} attempt(s)."
        if proxy_active:
            error_msg += " All proxies failed. YouTube may be blocking these IPs."
        else:
            error_msg += " No proxies configured. YouTube is likely blocking your server IP."

        raise RuntimeError(f"{error_msg} Last error: {last_exception}") from last_exception

    def _fetch_best_transcript(self, transcript_list, lang_candidates: list[str], prefer_manual: bool) -> str:
        """
        Fetch the best matching transcript from the list.

        Tries manual first when prefer_manual=True, then falls back to auto-generated.
        """
        if prefer_manual:
            # Try manual transcript first
            try:
                transcript = transcript_list.find_transcript(lang_candidates)
                if not transcript.is_generated:
                    return " ".join(snippet.text for snippet in transcript.fetch())
            except NoTranscriptFound:
                pass

            # Fall back to auto-generated
            try:
                transcript = transcript_list.find_generated_transcript(lang_candidates)
                return " ".join(snippet.text for snippet in transcript.fetch())
            except NoTranscriptFound:
                pass
        else:
            # Prefer auto-generated
            try:
                transcript = transcript_list.find_generated_transcript(lang_candidates)
                return " ".join(snippet.text for snippet in transcript.fetch())
            except NoTranscriptFound:
                pass

            # Fall back to manual
            try:
                transcript = transcript_list.find_transcript(lang_candidates)
                return " ".join(snippet.text for snippet in transcript.fetch())
            except NoTranscriptFound:
                pass

        lang_str = ", ".join(lang_candidates)
        raise ValueError(f"No transcript found for language(s): {lang_str}")
