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
    .select("plan, chars_balance, subscription_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <UserDashboard
        userId={user.id}
        email={user.email ?? ""}
        createdAt={user.created_at}
        plan={profile?.plan ?? "free"}
        subscriptionStatus={profile?.subscription_status ?? null}
        charsBalance={profile?.chars_balance ?? 0}
      />
      <div className="border-t border-white/5 pt-8">
        <h2 className="font-display text-lg font-semibold text-white mb-6">Account Details</h2>
        <ProfileForm email={user.email ?? ""} userId={user.id} />
      </div>
    </div>
  );
}
