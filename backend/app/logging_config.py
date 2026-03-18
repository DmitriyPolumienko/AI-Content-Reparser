"""
Structured JSON logging configuration for V2Post API.

Usage:
    from app.logging_config import setup_logging, request_id_var

    # At application startup:
    setup_logging()

    # Inside a request handler:
    logger.info("msg", extra={"request_id": request_id_var.get()})

The request_id ContextVar is populated by RequestIdMiddleware in main.py and
flows through sync and async call chains automatically.
"""

import json
import logging
import os
from contextvars import ContextVar

# ── Request-ID context variable ─────────────────────────────────────────────
# Set by RequestIdMiddleware on every incoming request so that all log lines
# emitted during that request carry the same correlation ID.
request_id_var: ContextVar[str] = ContextVar("request_id", default="")


# ── JSON formatter ───────────────────────────────────────────────────────────

class JsonFormatter(logging.Formatter):
    """Emit one JSON object per log line with consistent key-value fields."""

    # Extra keys that routers may attach via `extra={...}`.
    _EXTRA_KEYS = (
        "request_id",
        "method",
        "path",
        "status_code",
        "duration_ms",
        "error_type",
    )

    def format(self, record: logging.LogRecord) -> str:
        data: dict = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }

        # Inject request_id from ContextVar when not explicitly provided
        req_id = getattr(record, "request_id", None) or request_id_var.get()
        if req_id:
            data["request_id"] = req_id

        for key in self._EXTRA_KEYS:
            if key == "request_id":
                continue  # already handled above
            val = getattr(record, key, None)
            if val is not None:
                data[key] = val

        if record.exc_info:
            data["exc"] = self.formatException(record.exc_info)

        return json.dumps(data, ensure_ascii=False)


# ── Public setup function ────────────────────────────────────────────────────

def setup_logging() -> None:
    """
    Configure the root logger with a JSON stream handler.

    Log level is read from the LOG_LEVEL environment variable (default INFO).
    Call once at application startup (in main.py lifespan or at module level).
    """
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    # Avoid duplicate handlers if setup_logging is called more than once
    has_json_handler = any(
        isinstance(h.formatter, JsonFormatter) for h in root.handlers
    )
    if not has_json_handler:
        root.handlers.clear()
        root.addHandler(handler)

    root.setLevel(level)
