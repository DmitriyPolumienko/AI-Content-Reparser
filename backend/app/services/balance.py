from __future__ import annotations

"""Mock balance service — replace with Supabase logic in production."""

# In-memory store for demo purposes.
_MOCK_BALANCES: dict[str, int] = {}
_DEFAULT_BALANCE = 10_000  # words


def get_balance(user_id: str) -> int:
    """Return the current word-token balance for a user."""
    return _MOCK_BALANCES.get(user_id, _DEFAULT_BALANCE)


def deduct_balance(user_id: str, words_used: int) -> int:
    """Deduct words_used from the user's balance and return new balance.

    Raises:
        ValueError: If the user has insufficient balance.
    """
    current = _MOCK_BALANCES.get(user_id, _DEFAULT_BALANCE)
    if current < words_used:
        raise ValueError(
            f"Insufficient balance: {current} words left, {words_used} needed."
        )
    new_balance = current - words_used
    _MOCK_BALANCES[user_id] = new_balance
    return new_balance
