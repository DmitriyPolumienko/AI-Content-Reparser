-- =============================================================
-- 001_initial_schema.sql
-- Run this once in Supabase Dashboard → SQL Editor
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Users (extends Supabase auth.users)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    words_remaining   INTEGER DEFAULT 10000,
    total_words_used  INTEGER DEFAULT 0
);

-- ---------------------------------------------------------------
-- 2. Transcripts
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transcripts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    video_url        TEXT NOT NULL,
    video_id         TEXT NOT NULL,
    transcript_text  TEXT NOT NULL,
    word_count       INTEGER NOT NULL,
    language         TEXT DEFAULT 'en',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 3. Generated content
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_content (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transcript_id  UUID REFERENCES public.transcripts(id) ON DELETE SET NULL,
    content_type   TEXT NOT NULL CHECK (content_type IN ('seo_article', 'linkedin_post', 'twitter_thread')),
    content        TEXT NOT NULL,
    keywords       TEXT[],
    words_used     INTEGER NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id       ON public.transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_video_id      ON public.transcripts(video_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);

-- ---------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- transcripts
CREATE POLICY "Users can view own transcripts"
    ON public.transcripts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts"
    ON public.transcripts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- generated_content
CREATE POLICY "Users can view own generated content"
    ON public.generated_content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated content"
    ON public.generated_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 6. Helper function: atomic word-balance decrement
--    Called from the backend via client.rpc('decrement_user_words', ...)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_user_words(
    p_user_id    UUID,
    p_words_used INTEGER
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.users
    SET
        words_remaining  = GREATEST(0, words_remaining - p_words_used),
        total_words_used = total_words_used + p_words_used
    WHERE id = p_user_id;
$$;

