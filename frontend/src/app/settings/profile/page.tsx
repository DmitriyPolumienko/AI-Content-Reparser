import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileTabs from "@/components/settings/ProfileTabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("plan, chars_balance, subscription_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Profile</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your account details.</p>
      <ProfileTabs
        email={user.email ?? ""}
        userId={user.id}
        createdAt={user.created_at}
        plan={profile?.plan ?? "free"}
        subscriptionStatus={profile?.subscription_status ?? null}
        charsBalance={profile?.chars_balance ?? 0}
      />
    </div>
  );
}
