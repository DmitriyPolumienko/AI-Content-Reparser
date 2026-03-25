import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillingSettings from "@/components/settings/BillingSettings";
import { computeCharsRemaining } from "@/lib/plans";

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

  const plan = profile?.plan ?? "free";
  const charsBalance = computeCharsRemaining(plan, profile?.chars_used_in_period ?? 0);

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
