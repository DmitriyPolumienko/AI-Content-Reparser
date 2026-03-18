"""
Plan limits configuration for symbol-based usage accounting.

Each plan defines:
- period: "weekly" (Free) or "daily" (Pro/Enterprise) — reset in UTC
- period_limit: total symbols (input_chars + output_chars) allowed per period
- max_input_chars: maximum input characters for a single generation request
- max_output_chars: maximum output characters for a single generation request
- overage_allowed: whether overage (beyond the period limit) is permitted
- overage_cap_multiplier: max overage = cap × period_limit (None = no overage)
- video_minutes_tooltip: hardcoded hint shown in the pricing UI

Overage formula (for billing reference — billing integration is a future step):
    base_cost_per_symbol = price_per_month / (period_limit * 30)
    overage_cost_per_symbol = base_cost_per_symbol * 1.4

Overage is accumulated during the month and billed at end of month together
with the subscription charge (similar to Replit's usage billing model).
"""

from __future__ import annotations

import datetime
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class PlanLimits:
    name: str
    price_per_month: float
    period: str  # "weekly" | "daily"
    period_limit: int  # total symbols (input + output) per period
    max_input_chars: int  # per-request input cap
    max_output_chars: int  # per-request output cap
    overage_allowed: bool
    overage_cap_multiplier: Optional[int]  # effective_limit = period_limit * (1 + cap)
    video_minutes_tooltip: str


PLAN_LIMITS: dict[str, PlanLimits] = {
    "free": PlanLimits(
        name="Free",
        price_per_month=0.0,
        period="weekly",
        period_limit=18_000,
        max_input_chars=3_000,
        max_output_chars=3_000,
        overage_allowed=False,
        overage_cap_multiplier=None,
        video_minutes_tooltip="≈ 10–15 min video (average)",
    ),
    "pro": PlanLimits(
        name="Pro",
        price_per_month=11.99,
        period="daily",
        period_limit=90_000,
        max_input_chars=50_000,
        max_output_chars=20_000,
        overage_allowed=True,
        overage_cap_multiplier=5,
        video_minutes_tooltip="≈ 60 min video (average)",
    ),
    "enterprise": PlanLimits(
        name="Enterprise",
        price_per_month=27.99,
        period="daily",
        period_limit=360_000,
        max_input_chars=150_000,
        max_output_chars=30_000,
        overage_allowed=True,
        overage_cap_multiplier=5,
        video_minutes_tooltip="≈ 4 hours video (average)",
    ),
}


def get_overage_cost_per_symbol(plan_key: str) -> Optional[float]:
    """
    Return the overage cost per symbol for *plan_key*, or None if that plan
    does not permit overage.

    Formula:
        base_cost_per_symbol = price_per_month / (period_limit * 30)
        overage_cost_per_symbol = base_cost_per_symbol * 1.4
    """
    plan = PLAN_LIMITS.get(plan_key)
    if plan is None or not plan.overage_allowed:
        return None
    base_cost = plan.price_per_month / (plan.period_limit * 30)
    return base_cost * 1.4


def get_period_start_utc(period: str) -> datetime.datetime:
    """
    Return the UTC datetime at which the current period started.

    - "weekly"  → Monday 00:00:00 UTC of the current ISO week
    - "daily"   → 00:00:00 UTC of the current calendar day

    The returned datetime is timezone-aware (UTC).
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    if period == "weekly":
        return now - datetime.timedelta(
            days=now.weekday(),
            hours=now.hour,
            minutes=now.minute,
            seconds=now.second,
            microseconds=now.microsecond,
        )
    if period == "daily":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    raise ValueError(f"Unknown period: {period!r}")
