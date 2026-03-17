"""Shared SlowAPI rate limiter instance used across the application."""
from slowapi import Limiter
from slowapi.util import get_remote_address

# No default_limits here – per-endpoint limits are applied via @limiter.limit() decorators
limiter = Limiter(key_func=get_remote_address)
