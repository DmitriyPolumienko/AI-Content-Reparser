"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/effects/Toast";
import Navbar from "@/components/landing/Navbar";

const navItems = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/billing", label: "Billing" },
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
    <div className="min-h-screen bg-[#030014] text-white">
      <Navbar variant="dashboard" />

      {/* Horizontal tab bar */}
      <div className="border-b border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "text-emerald-400 border-emerald-400"
                      : "text-slate-400 border-transparent hover:text-white hover:border-white/20"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="ml-auto px-4 py-3.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors duration-200 whitespace-nowrap border-b-2 border-transparent disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
