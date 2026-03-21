import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/settings/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Profile</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your account details.</p>
      <ProfileForm email={user.email ?? ""} userId={user.id} />
    </div>
  );
}
