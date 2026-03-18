-- Migration 003: Persistent application statistics counter
--
-- Creates the app_stats table to store global key/value counters that
-- survive server restarts and work correctly across multiple workers.
--
-- Initial seed: videos_processed = 247 (matches the previous in-memory seed).

-- ---------------------------------------------------------------
-- 1. app_stats table
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_stats (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key        TEXT        UNIQUE NOT NULL,
    value      BIGINT      NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 2. Seed the initial counter value
-- ---------------------------------------------------------------
INSERT INTO public.app_stats (key, value)
VALUES ('videos_processed', 247)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------
-- 3. Atomic increment helper
--    Increments the counter by 1 and returns the new value.
--    Using UPDATE ... RETURNING is safe under concurrent load.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_stat(p_key TEXT)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.app_stats
    SET value      = value + 1,
        updated_at = now()
    WHERE key = p_key
    RETURNING value;
$$;
