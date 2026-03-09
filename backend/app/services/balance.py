from typing import Dict, Any

MOCK_USERS: Dict[str, Dict[str, Any]] = {
    "mock-user-123": {"token_words_left": 10000},
}


def get_balance(user_id: str) -> int:
    """Return the number of words remaining for the given user."""
    user = MOCK_USERS.get(user_id)
    if user is None:
        raise ValueError(f"User '{user_id}' not found.")
    return user["token_words_left"]


def deduct_balance(user_id: str, words_used: int) -> int:
    """Deduct words from a user's balance and return the new balance."""
    user = MOCK_USERS.get(user_id)
    if user is None:
        raise ValueError(f"User '{user_id}' not found.")
    if user["token_words_left"] < words_used:
        raise ValueError("Insufficient word balance.")
    user["token_words_left"] -= words_used
    return user["token_words_left"]
