"""
Symbol-based usage accounting for user plans.

Usage is tracked as *characters* (input_chars + output_chars) rather than
words.  Each user record stores how many symbols were consumed in the current
period together with the UTC start time of that period.  On every call the
period is checked and reset automatically when a new period begins.

Plan periods:
    free        → weekly  (resets Monday 00:00 UTC)
    pro         → daily   (resets 00:00 UTC)
    enterprise  → daily   (resets 00:00 UTC)

Overage:
    free        → not allowed; hard limit at period_limit
    pro/ent     → allowed up to 5 × period_limit; billed at end of month
"""

import datetime
import sys
from typing import Any, Dict

from app.services.plan_config import PLAN_LIMITS, PlanLimits, get_period_start_utc

# ---------------------------------------------------------------------------
# TEMPORARY – remove once user roles / account features are fully implemented.
# ⚠️  NON-PRODUCTION ONLY: this bypass is safe because "mock-user-123" is a
#     hard-coded mock user that only exists in the in-memory MOCK_USERS store
#     used during local development / staging.  It must be removed before any
#     real user-authentication system is wired up.
# This user ID bypasses all per-request and period symbol limits so that
# full end-to-end generation can be tested without hitting the free-plan cap.
# To revert: delete this block and all three "_is_unlimited_user" branches below.
# ---------------------------------------------------------------------------
_TESTING_UNLIMITED_USER_ID = "mock-user-123"
_UNLIMITED_PLAN_LIMITS = PlanLimits(
    name="Unlimited (testing)",
    price_per_month=0.0,
    period="daily",  # required field; never evaluated for this user (bypassed early)
    period_limit=sys.maxsize,
    max_input_chars=sys.maxsize,
    max_output_chars=sys.maxsize,
    overage_allowed=True,
    overage_cap_multiplier=None,
    video_minutes_tooltip="Unlimited (testing)",
)

# ---------------------------------------------------------------------------
# Mock user store
# Each entry maps user_id → { plan, chars_used_in_period, period_start }
# ---------------------------------------------------------------------------
MOCK_USERS: Dict[str, Dict[str, Any]] = {
    "mock-user-123": {
        "plan": "free",
        "chars_used_in_period": 0,
        "period_start": None,  # initialised on first access
    },
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_plan(user: Dict[str, Any]) -> PlanLimits:
    plan_key = user.get("plan", "free")
    plan = PLAN_LIMITS.get(plan_key)
    if plan is None:
        plan = PLAN_LIMITS["free"]
    return plan


def _effective_limit(plan: PlanLimits) -> int:
    """Total symbols allowed including overage cap."""
    if plan.overage_allowed and plan.overage_cap_multiplier:
        return plan.period_limit * (1 + plan.overage_cap_multiplier)
    return plan.period_limit


def _ensure_period(user: Dict[str, Any]) -> None:
    """Reset chars_used_in_period when a new period has started (UTC)."""
    plan = _get_plan(user)
    period_start = get_period_start_utc(plan.period)
    stored_start = user.get("period_start")
    if stored_start is None or stored_start < period_start:
        user["chars_used_in_period"] = 0
        user["period_start"] = period_start


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_plan_limits(user_id: str) -> PlanLimits:
    """Return the PlanLimits for the given user."""
    # TEMPORARY: bypass all limits for the test user (see _TESTING_UNLIMITED_USER_ID).
    if user_id == _TESTING_UNLIMITED_USER_ID:
        return _UNLIMITED_PLAN_LIMITS
    user = MOCK_USERS.get(user_id)
    if user is None:
        raise ValueError(f"User '{user_id}' not found.")
    return _get_plan(user)


def get_balance(user_id: str) -> int:
    """Return the number of symbols remaining for the user in the current period."""
    # TEMPORARY: bypass all limits for the test user (see _TESTING_UNLIMITED_USER_ID).
    if user_id == _TESTING_UNLIMITED_USER_ID:
        return sys.maxsize
    user = MOCK_USERS.get(user_id)
    if user is None:
        raise ValueError(f"User '{user_id}' not found.")
    _ensure_period(user)
    plan = _get_plan(user)
    used = user["chars_used_in_period"]
    return max(0, _effective_limit(plan) - used)


def deduct_balance(user_id: str, chars_used: int) -> int:
    """
    Deduct *chars_used* symbols from the user's period balance.

    Returns the updated chars_remaining value.

    Raises ValueError when:
    - the user is not found
    - Free plan has exhausted its period limit (no overage)
    - Pro/Enterprise has exhausted the overage cap
    """
    # TEMPORARY: bypass all limits for the test user (see _TESTING_UNLIMITED_USER_ID).
    if user_id == _TESTING_UNLIMITED_USER_ID:
        return sys.maxsize
    user = MOCK_USERS.get(user_id)
    if user is None:
        raise ValueError(f"User '{user_id}' not found.")
    _ensure_period(user)
    plan = _get_plan(user)
    used = user["chars_used_in_period"]
    limit = _effective_limit(plan)

    if not plan.overage_allowed and used >= plan.period_limit:
        raise ValueError(
            "Symbol limit reached for this period. Please upgrade your plan."
        )
    if used + chars_used > limit:
        raise ValueError(
            "Symbol limit (including overage cap) reached for this period."
        )

    user["chars_used_in_period"] = used + chars_used
    return max(0, limit - user["chars_used_in_period"])
