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
import logging
import sys
from typing import Any, Dict

from app.services.plan_config import PLAN_LIMITS, PlanLimits, get_period_start_utc

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Local-dev fallback store (used only when Supabase client is not configured)
# Keyed by user_id; initialised with free plan defaults on first access.
# ---------------------------------------------------------------------------
_LOCAL_USERS: Dict[str, Dict[str, Any]] = {}


def _get_local_user(user_id: str) -> Dict[str, Any]:
    if user_id not in _LOCAL_USERS:
        _LOCAL_USERS[user_id] = {
            "plan": "free",
            "chars_used_in_period": 0,
            "period_start": None,
        }
    return _LOCAL_USERS[user_id]


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


def _fetch_user_from_db(user_id: str) -> Dict[str, Any] | None:
    """Return the user row dict from Supabase or None if not configured/not found."""
    from app.services.database import _get_client  # local import to avoid circular
    client = _get_client()
    if client is None:
        return None
    try:
        response = (
            client.table("users")
            .select("plan, chars_used_in_period, period_start")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return response.data if response.data else None
    except Exception as exc:
        logger.error("balance: failed to fetch user '%s' from Supabase: %s", user_id, exc)
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_plan_limits(user_id: str) -> PlanLimits:
    """Return the PlanLimits for the given user."""
    row = _fetch_user_from_db(user_id)
    if row is not None:
        return _get_plan(row)
    # Supabase not configured — local dev fallback
    logger.warning("balance: Supabase not configured, using local-dev fallback for user '%s'", user_id)
    user = _get_local_user(user_id)
    return _get_plan(user)


def get_balance(user_id: str) -> int:
    """Return the number of symbols remaining for the user in the current period."""
    row = _fetch_user_from_db(user_id)
    if row is not None:
        _ensure_period(row)
        plan = _get_plan(row)
        used = row.get("chars_used_in_period", 0) or 0
        return max(0, _effective_limit(plan) - used)
    # Supabase not configured — local dev fallback
    logger.warning("balance: Supabase not configured, using local-dev fallback for user '%s'", user_id)
    user = _get_local_user(user_id)
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
    from app.services.database import _get_client  # local import to avoid circular
    client = _get_client()

    if client is not None:
        # Fetch current state for limit checks
        row = _fetch_user_from_db(user_id)
        if row is None:
            raise ValueError(f"User '{user_id}' not found.")
        _ensure_period(row)
        plan = _get_plan(row)
        used = row.get("chars_used_in_period", 0) or 0
        limit = _effective_limit(plan)

        if not plan.overage_allowed and used >= plan.period_limit:
            raise ValueError(
                "Symbol limit reached for this period. Please upgrade your plan."
            )
        if used + chars_used > limit:
            raise ValueError(
                "Symbol limit (including overage cap) reached for this period."
            )

        # Atomically deduct via Supabase RPC
        try:
            period_start = row.get("period_start")
            if isinstance(period_start, datetime.datetime):
                period_start_str = period_start.isoformat()
            else:
                period_start_str = str(period_start) if period_start else None

            rpc_response = client.rpc(
                "decrement_user_chars",
                {
                    "p_user_id": user_id,
                    "p_chars_used": chars_used,
                    "p_period_start": period_start_str,
                },
            ).execute()
            new_used = used + chars_used
            return max(0, limit - new_used)
        except Exception as exc:
            logger.error("balance: RPC decrement_user_chars failed for '%s': %s", user_id, exc)
            # Fall through to local update estimate
            new_used = used + chars_used
            return max(0, limit - new_used)

    # Supabase not configured — local dev fallback
    logger.warning("balance: Supabase not configured, using local-dev fallback for user '%s'", user_id)
    user = _get_local_user(user_id)
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
