"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/effects/Toast";

const navItems = [
  { href: "/settings/profile", label: "Profile", icon: UserIcon },
  { href: "/settings/security", label: "Security", icon: ShieldIcon },
  { href: "/settings/billing", label: "Billing", icon: CreditCardIcon },
];

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [signingOut, setSigningOut] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(error.message, "error");
      setSigningOut(false);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/5 flex flex-col py-8 px-4 fixed left-0 top-0 h-full">
        <Link
          href="/dashboard"
          className="font-display text-xl font-bold text-white mb-8 px-2 block hover:text-emerald-400 transition-colors"
        >
          V2<span className="text-emerald-400">Post</span>
        </Link>

        <p className="text-xs uppercase tracking-widest text-slate-500 px-2 mb-3">
          Settings
        </p>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 disabled:opacity-50"
        >
          <SignOutIcon className="w-4 h-4 shrink-0" />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
