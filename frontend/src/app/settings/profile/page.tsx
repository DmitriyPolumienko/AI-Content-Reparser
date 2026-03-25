import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/settings/ProfileForm";
import UserDashboard from "@/components/settings/UserDashboard";
import { computeCharsRemaining } from "@/lib/plans";

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

  const plan = profile?.plan ?? "free";
  const charsBalance = computeCharsRemaining(plan, profile?.chars_used_in_period ?? 0);

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
