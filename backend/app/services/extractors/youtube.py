import re
import os
import random
import logging

import requests
import yt_dlp

from app.services.extractors.base import VideoExtractor

logger = logging.getLogger(__name__)

# Mapping of common ISO 639-1 language codes to human-readable names.
_LANG_NAMES: dict[str, str] = {
    "af": "Afrikaans",
    "ak": "Akan",
    "sq": "Albanian",
    "am": "Amharic",
    "ar": "Arabic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bem": "Bemba",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "fi": "Finnish",
    "fr": "French",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Indonesian",
    "is": "Icelandic",
    "it": "Italian",
    "ja": "Japanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "ko": "Korean",
    "lo": "Lao",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "ms": "Malay",
    "ml": "Malayalam",
    "mr": "Marathi",
    "mn": "Mongolian",
    "my": "Burmese",
    "ne": "Nepali",
    "no": "Norwegian",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "sw": "Swahili",
    "sv": "Swedish",
    "tl": "Filipino",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "xh": "Xhosa",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu",
    "zh": "Chinese",
    "zh-Hans": "Chinese (Simplified)",
    "zh-Hant": "Chinese (Traditional)",
}


class YouTubeExtractor(VideoExtractor):
    """Extracts transcripts from YouTube videos using yt-dlp with proxy support."""

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

    def _get_proxy_url(self) -> str | None:
        """Return a proxy URL string suitable for yt-dlp, or None if no proxy is configured."""
        if self._rotating_proxy_configured():
            return self._get_random_proxy()

        if self._legacy_proxy_list:
            proxy_url = random.choice(self._legacy_proxy_list)
            logger.info("Using static proxy from list")
            return proxy_url

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

    def _build_ydl_opts(self, proxy_url: str | None) -> dict:
        """Build yt-dlp options dict."""
        opts: dict = {
            "skip_download": True,
            "quiet": True,
            "no_warnings": True,
        }
        if proxy_url:
            opts["proxy"] = proxy_url
        return opts

    @staticmethod
    def _get_language_name(lang_code: str) -> str:
        """Map language codes to human-readable names."""
        return _LANG_NAMES.get(lang_code, lang_code.upper())

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
                proxy_url = self._get_proxy_url()
                ydl_opts = self._build_ydl_opts(proxy_url)

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(
                        f"https://www.youtube.com/watch?v={video_id}",
                        download=False,
                    )

                subtitles: dict = info.get("subtitles", {}) or {}
                automatic_captions: dict = info.get("automatic_captions", {}) or {}

                available = []

                # Manual subtitles first
                for lang_code, formats in subtitles.items():
                    if formats:
                        available.append({
                            "language_code": lang_code,
                            "language_name": self._get_language_name(lang_code),
                            "is_generated": False,
                            "is_translatable": False,
                        })

                # Auto-generated subtitles second (skip languages already present as manual)
                for lang_code, formats in automatic_captions.items():
                    if formats and lang_code not in subtitles:
                        available.append({
                            "language_code": lang_code,
                            "language_name": f"{self._get_language_name(lang_code)} (auto-generated)",
                            "is_generated": True,
                            "is_translatable": False,
                        })

                logger.info("Listed %d transcripts for %s", len(available), video_id)
                return available

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
                proxy_url = self._get_proxy_url()
                ydl_opts = self._build_ydl_opts(proxy_url)

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(
                        f"https://www.youtube.com/watch?v={video_id}",
                        download=False,
                    )

                subtitles: dict = info.get("subtitles", {}) or {}
                automatic_captions: dict = info.get("automatic_captions", {}) or {}

                lang_candidates = [language] if language else ["en", "ru"]

                text = self._fetch_best_transcript(
                    subtitles, automatic_captions, lang_candidates, prefer_manual
                )
                logger.info("Successfully extracted transcript for %s (attempt %d)", video_id, attempt + 1)
                return text

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

    def _fetch_best_transcript(
        self,
        subtitles: dict,
        automatic_captions: dict,
        lang_candidates: list[str],
        prefer_manual: bool,
    ) -> str:
        """
        Select and download the best matching subtitle track.

        Applies prefer_manual preference, then falls back to the opposite type.
        Raises ValueError if no matching transcript can be found.
        """
        def _try_sources(primary: dict, fallback: dict) -> str | None:
            for lang in lang_candidates:
                if lang in primary and primary[lang]:
                    return self._download_subtitle(primary[lang])
            for lang in lang_candidates:
                if lang in fallback and fallback[lang]:
                    return self._download_subtitle(fallback[lang])
            return None

        if prefer_manual:
            result = _try_sources(subtitles, automatic_captions)
        else:
            result = _try_sources(automatic_captions, subtitles)

        if result is None:
            lang_str = ", ".join(lang_candidates)
            raise ValueError(f"No transcript found for language(s): {lang_str}")

        return result

    def _download_subtitle(self, formats: list) -> str:
        """Download and parse subtitle content from the first supported format URL."""
        # Prefer json3/srv3 (JSON-based YouTube subtitle formats) for easy parsing.
        preferred_exts = ("json3", "srv3", "vtt", "ttml")

        def _sort_key(fmt: dict) -> int:
            ext = fmt.get("ext", "")
            try:
                return preferred_exts.index(ext)
            except ValueError:
                return len(preferred_exts)

        for fmt in sorted(formats, key=_sort_key):
            sub_url = fmt.get("url")
            if not sub_url:
                continue
            ext = fmt.get("ext", "")
            try:
                response = requests.get(sub_url, timeout=15)
                response.raise_for_status()
                if ext in ("json3", "srv3"):
                    return self._parse_json3(response.json())
                # Fall back to stripping tags for VTT/TTML
                return self._strip_subtitle_markup(response.text)
            except Exception as exc:
                logger.warning("Failed to download subtitle format %s: %s", ext, exc)

        raise ValueError("Could not download subtitle in any supported format")

    @staticmethod
    def _parse_json3(data: dict) -> str:
        """Parse YouTube's json3 subtitle format into plain text."""
        text_parts: list[str] = []
        for event in data.get("events", []):
            for seg in event.get("segs", []):
                fragment = seg.get("utf8", "")
                if fragment and fragment != "\n":
                    text_parts.append(fragment)
        return " ".join(text_parts).strip()

    @staticmethod
    def _strip_subtitle_markup(raw: str) -> str:
        """Remove subtitle markup tags and timing lines from VTT/TTML content."""
        # Remove XML/HTML tags
        text = re.sub(r"<[^>]+>", "", raw)
        lines = []
        for line in text.splitlines():
            line = line.strip()
            # Skip WebVTT headers, timing lines, and blank lines
            if not line or line.startswith("WEBVTT") or "-->" in line:
                continue
            lines.append(line)
        return " ".join(lines).strip()

