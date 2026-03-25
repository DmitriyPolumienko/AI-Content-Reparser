import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/settings/ProfileForm";
import UserDashboard from "@/components/settings/UserDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("plan, chars_used_in_period, period_start, subscription_status")
    .eq("id", user.id)
    .single();

  // Compute chars remaining from plan limits and usage (mirrors backend balance service)
  const plan = profile?.plan ?? "free";
  const PLAN_PERIOD_LIMITS: Record<string, number> = { free: 18_000, pro: 90_000, enterprise: 360_000 };
  const PLAN_OVERAGE: Record<string, number> = { pro: 5, enterprise: 5 };
  const periodLimit = PLAN_PERIOD_LIMITS[plan] ?? 18_000;
  const overageMult = PLAN_OVERAGE[plan];
  const effectiveLimit = overageMult ? periodLimit * (1 + overageMult) : periodLimit;
  const used = profile?.chars_used_in_period ?? 0;
  const charsBalance = Math.max(0, effectiveLimit - used);

  return (
    <div className="flex flex-col gap-8">
      <UserDashboard
        userId={user.id}
        email={user.email ?? ""}
        createdAt={user.created_at}
        plan={plan}
        subscriptionStatus={profile?.subscription_status ?? null}
        charsBalance={charsBalance}
      />
      <div className="border-t border-white/5 pt-8">
        <h2 className="font-display text-lg font-semibold text-white mb-6">Update Email</h2>
        <ProfileForm email={user.email ?? ""} />
      </div>
    </div>
  );
}
