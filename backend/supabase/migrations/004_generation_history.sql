-- =============================================================
-- 004_generation_history.sql
-- Adds a generation_history table for per-user saved generations.
-- Uses TEXT user_id so mock / unauthenticated users are supported.
-- Run once in Supabase Dashboard → SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS public.generation_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL,
    content_type  TEXT NOT NULL,
    title         TEXT,
    video_url     TEXT,
    content       TEXT NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fast look-ups by user (most recent first)
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id
    ON public.generation_history (user_id);

CREATE INDEX IF NOT EXISTS idx_generation_history_created_at
    ON public.generation_history (created_at DESC);

-- RLS: allow the service-role key (used by the backend) to read/write freely.
-- Anon / authenticated clients cannot access this table directly.
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on generation_history"
    ON public.generation_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
