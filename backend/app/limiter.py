"""Shared SlowAPI rate limiter instance used across the application."""
from slowapi import Limiter
from slowapi.util import get_remote_address

# 10 requests per minute per IP address
limiter = Limiter(key_func=get_remote_address, default_limits=["10/minute"])
