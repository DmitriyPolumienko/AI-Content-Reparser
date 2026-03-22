import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SecuritySettings from "@/components/settings/SecuritySettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Security</h1>
      <p className="text-slate-400 text-sm mb-8">
        Manage two-factor authentication and security settings.
      </p>
      <SecuritySettings
        email={user.email ?? ""}
        userId={user.id}
        createdAt={user.created_at}
      />
    </div>
  );
}
