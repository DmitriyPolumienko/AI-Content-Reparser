-- Migration 005: Add Stripe billing columns to the existing users table
--
-- Run this in Supabase Dashboard → SQL Editor.
-- This extends the existing public.users table with Stripe subscription
-- tracking and a chars_balance counter.
--
-- subscription_status values: active | canceled | past_due | NULL (free)

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
    ADD COLUMN IF NOT EXISTS subscription_status     TEXT CHECK (
        subscription_status IN ('active', 'canceled', 'past_due')
    ),
    ADD COLUMN IF NOT EXISTS chars_balance           INTEGER NOT NULL DEFAULT 0;

-- Index for fast lookup by Stripe customer id (used in webhook handler)
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
    ON public.users(stripe_customer_id);
