import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillingSettings from "@/components/settings/BillingSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch subscription info from users table
  const { data: profile } = await supabase
    .from("users")
    .select("subscription_status, chars_used_in_period, period_start, plan")
    .eq("id", user.id)
    .single();

  // Compute chars remaining from plan limits and usage
  const plan = profile?.plan ?? "free";
  const PLAN_PERIOD_LIMITS: Record<string, number> = { free: 18_000, pro: 90_000, enterprise: 360_000 };
  const PLAN_OVERAGE: Record<string, number> = { pro: 5, enterprise: 5 };
  const periodLimit = PLAN_PERIOD_LIMITS[plan] ?? 18_000;
  const overageMult = PLAN_OVERAGE[plan];
  const effectiveLimit = overageMult ? periodLimit * (1 + overageMult) : periodLimit;
  const used = profile?.chars_used_in_period ?? 0;
  const charsBalance = Math.max(0, effectiveLimit - used);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Billing</h1>
      <p className="text-slate-400 text-sm mb-8">
        Manage your subscription and usage.
      </p>
      <BillingSettings
        currentPlan={plan}
        subscriptionStatus={profile?.subscription_status ?? null}
        charsBalance={charsBalance}
      />
    </div>
  );
}
