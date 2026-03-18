-- Migration 002: Switch from word-based to symbol-based usage accounting
--
-- Adds plan, symbol-usage tracking, and period-start columns to the users
-- table.  The old words_remaining / total_words_used columns are kept for
-- backward compatibility but are no longer updated by the application.
--
-- Plan values: 'free' | 'pro' | 'enterprise'
-- Period semantics (enforced in application layer, UTC):
--   free       → weekly  (resets Monday 00:00 UTC)
--   pro/ent    → daily   (resets 00:00 UTC)

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS plan                TEXT    NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS chars_used_in_period INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS period_start        TIMESTAMP;

-- Constraint: plan must be one of the supported tiers
ALTER TABLE public.users
    ADD CONSTRAINT users_plan_check
    CHECK (plan IN ('free', 'pro', 'enterprise'));

-- Update the generated_content table to store char-based metrics alongside
-- the legacy word metrics.
ALTER TABLE public.generated_content
    ADD COLUMN IF NOT EXISTS input_chars  INTEGER,
    ADD COLUMN IF NOT EXISTS output_chars INTEGER,
    ADD COLUMN IF NOT EXISTS chars_used   INTEGER;

-- Atomic helper: decrement symbol balance and update period usage.
-- Called after a successful generation (mirrors the old decrement_user_words).
CREATE OR REPLACE FUNCTION public.decrement_user_chars(
    p_user_id      UUID,
    p_chars_used   INTEGER,
    p_period_start TIMESTAMP
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.users
    SET
        chars_used_in_period = CASE
            WHEN period_start IS NULL OR period_start < p_period_start
            THEN p_chars_used
            ELSE chars_used_in_period + p_chars_used
        END,
        period_start = COALESCE(
            CASE WHEN period_start IS NULL OR period_start < p_period_start
                 THEN p_period_start END,
            period_start
        )
    WHERE id = p_user_id;
$$;
