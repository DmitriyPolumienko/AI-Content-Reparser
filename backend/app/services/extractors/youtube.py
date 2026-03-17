import re
import os
import random
import logging

from pytubefix import YouTube
from pytubefix.exceptions import VideoUnavailable

from app.services.extractors.base import VideoExtractor

logger = logging.getLogger(__name__)


class YouTubeExtractor(VideoExtractor):
    """Extracts transcripts from YouTube videos using pytubefix with proxy support."""

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

    def _build_proxies_dict(self) -> dict | None:
        """Return a proxies dict for pytubefix, or None if no proxy is configured."""
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
                proxies = self._build_proxies_dict()

                yt = YouTube(url, proxies=proxies)

                captions = yt.captions

                if not captions:
                    raise ValueError("No transcripts available for this video")

                manual_captions = []
                auto_captions = []

                for caption in captions:
                    caption_info = {
                        # Strip the 'a.' prefix so callers receive a plain language code (e.g. 'en')
                        "language_code": self._bare_lang_code(caption.code),
                        "language_name": caption.name,
                        "is_generated": self._is_auto_generated(caption),
                        "is_translatable": False,
                    }

                    if caption_info["is_generated"]:
                        caption_info["language_name"] = f"{caption.name} (auto-generated)"
                        auto_captions.append(caption_info)
                    else:
                        manual_captions.append(caption_info)

                available = manual_captions + auto_captions

                logger.info("Listed %d transcripts for %s", len(available), video_id)
                return available

            except VideoUnavailable:
                raise ValueError("Video is unavailable or private")

            except ValueError:
                raise

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
                proxies = self._build_proxies_dict()

                yt = YouTube(url, proxies=proxies)

                captions = yt.captions

                if not captions:
                    raise ValueError("No transcripts available for this video")

                lang_candidates = [language] if language else ["en", "ru"]

                manual_captions = [c for c in captions if not self._is_auto_generated(c)]
                auto_captions = [c for c in captions if self._is_auto_generated(c)]

                caption_to_use = None

                for lang in lang_candidates:
                    if prefer_manual:
                        caption_to_use = self._find_caption_by_code(manual_captions, lang)
                        if caption_to_use:
                            break
                        caption_to_use = self._find_caption_by_code(auto_captions, lang)
                        if caption_to_use:
                            break
                    else:
                        caption_to_use = self._find_caption_by_code(auto_captions, lang)
                        if caption_to_use:
                            break
                        caption_to_use = self._find_caption_by_code(manual_captions, lang)
                        if caption_to_use:
                            break

                if not caption_to_use:
                    raise ValueError(f"No transcript found for language(s): {', '.join(lang_candidates)}")

                srt_captions = caption_to_use.generate_srt_captions()
                text = self._parse_srt_to_text(srt_captions)

                logger.info("Successfully extracted transcript for %s (attempt %d)", video_id, attempt + 1)
                return text

            except VideoUnavailable:
                raise ValueError("Video is unavailable or private")

            except ValueError:
                raise

            except Exception as exc:
                last_exception = exc
                logger.warning("Attempt %d failed: %s", attempt + 1, exc)

        error_msg = f"Failed to extract transcript after {max_attempts} attempt(s)."
        if proxy_active:
            error_msg += " All proxies failed. YouTube may be blocking these IPs."
        else:
            error_msg += " No proxies configured. YouTube is likely blocking your server IP."

        raise RuntimeError(f"{error_msg} Last error: {last_exception}") from last_exception

    @staticmethod
    def _is_auto_generated(caption) -> bool:
        """
        Return True if the caption track is auto-generated.

        pytubefix exposes the YouTube vssId field as caption.code. Auto-generated
        tracks use a vssId of the form 'a.<lang>' (e.g. 'a.en'), while manual
        tracks use plain codes like 'en' or 'en-US'.
        """
        return caption.code.startswith("a.")

    @staticmethod
    def _bare_lang_code(code: str) -> str:
        """Strip the 'a.' auto-generated prefix from a caption code, returning the plain language code."""
        return code[2:] if code.startswith("a.") else code

    @staticmethod
    def _find_caption_by_code(caption_list: list, lang_code: str):
        """Find caption by language code in a list of captions, ignoring the 'a.' auto-generated prefix."""
        for caption in caption_list:
            bare = caption.code[2:] if caption.code.startswith("a.") else caption.code
            if bare == lang_code or bare.startswith(f"{lang_code}-"):
                return caption
        return None

    @staticmethod
    def _parse_srt_to_text(srt_content: str) -> str:
        """
        Parse SRT subtitle format and extract only the text.

        SRT format:
        1
        00:00:00,000 --> 00:00:02,000
        Hello world

        2
        00:00:02,000 --> 00:00:04,000
        Second line
        """
        lines = srt_content.split("\n")
        text_parts = []

        for line in lines:
            line = line.strip()
            # Skip empty lines, sequence numbers, and timestamps
            if not line or line.isdigit() or "-->" in line:
                continue

            # Remove any HTML tags that might be present
            line = re.sub(r"<[^>]+>", "", line)

            if line:
                text_parts.append(line)

        return " ".join(text_parts)

