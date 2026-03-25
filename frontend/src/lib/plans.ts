/**
 * Shared plan configuration and balance calculation utilities.
 * Single source of truth for plan limits — mirrors backend plan_config.py.
 */

export const PLAN_PERIOD_LIMITS: Record<string, number> = {
  free: 18_000,
  pro: 90_000,
  enterprise: 360_000,
};

export const PLAN_OVERAGE_MULTIPLIER: Record<string, number> = {
  pro: 5,
  enterprise: 5,
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

/**
 * Compute the effective limit for a plan (including overage cap if applicable).
 */
export function getEffectiveLimit(plan: string): number {
  const periodLimit = PLAN_PERIOD_LIMITS[plan] ?? PLAN_PERIOD_LIMITS.free;
  const overageMult = PLAN_OVERAGE_MULTIPLIER[plan];
  return overageMult ? periodLimit * (1 + overageMult) : periodLimit;
}

/**
 * Compute chars remaining from plan and chars_used_in_period.
 */
export function computeCharsRemaining(plan: string, charsUsedInPeriod: number): number {
  const effectiveLimit = getEffectiveLimit(plan);
  return Math.max(0, effectiveLimit - charsUsedInPeriod);
}
