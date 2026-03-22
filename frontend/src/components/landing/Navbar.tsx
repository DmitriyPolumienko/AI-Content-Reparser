"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerButton from "@/components/effects/ShimmerButton";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

const landingNavLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#blog", label: "Blog" },
];

const dashboardNavLinks = [
  { href: "/", label: "Home" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

interface NavbarProps {
  variant?: "landing" | "dashboard";
  charsRemaining?: number | null;
  onStartOver?: () => void;
}

function UserEmailBadge({ email }: { email: string }) {
  const short = email.length > 22 ? email.slice(0, 20) + "…" : email;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer max-w-[180px]">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
      >
        {email[0]?.toUpperCase() ?? "U"}
      </div>
      <span className="text-xs text-slate-300 leading-none truncate">{short}</span>
    </div>
  );
}

export default function Navbar({ variant = "landing", charsRemaining, onStartOver }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useUser();

  const isDashboard = variant === "dashboard";
  const navLinks = isDashboard ? dashboardNavLinks : landingNavLinks;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const userName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const userEmail = user?.email ?? "";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/50 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo-icon.png" alt="V2Post" width={36} height={36} />
          <span className="font-bold text-white font-display hidden sm:block">
            V2<span className="gradient-text">Post</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right-side */}
        <div className="hidden md:flex items-center gap-4">
          {isDashboard && (
            <div className="px-3 py-1.5 glass rounded-full text-xs text-slate-400">
              Chars remaining:{" "}
              <span className="text-emerald-400 font-semibold">
                {charsRemaining == null ? "—" : charsRemaining.toLocaleString()}
              </span>
            </div>
          )}
          {isDashboard && (
            <button
              onClick={onStartOver}
              className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
            >
              ↺ Start Over
            </button>
          )}

          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 focus:outline-none"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-sm font-semibold">
                        {userName?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white truncate">{userName}</p>
                          <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          {!isDashboard && (
                            <Link
                              href="/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <span>🚀</span> Dashboard
                            </Link>
                          )}
                          <Link
                            href="/settings/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <span>⚙️</span> Settings
                          </Link>
                        </div>

                        <div className="border-t border-white/5 py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                          >
                            <span>→</span> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <ShimmerButton size="sm" onClick={() => router.push("/login")}>
                    Get Started →
                  </ShimmerButton>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <motion.span
            className="w-5 h-0.5 bg-white block"
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-white block"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-white block"
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-black/80 backdrop-blur-2xl border-b border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-300 hover:text-white py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {isDashboard && (
                <>
                  <div className="px-3 py-1.5 glass rounded-full text-xs text-slate-400 text-center">
                    Chars remaining:{" "}
                    <span className="text-emerald-400 font-semibold">
                      {charsRemaining == null ? "—" : charsRemaining.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); onStartOver?.(); }}
                    className="text-sm text-slate-500 hover:text-emerald-400 transition-colors py-2"
                  >
                    ↺ Start Over
                  </button>
                </>
              )}

              {!loading && (
                <>
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 py-2 border-t border-white/10 mt-1">
                        <UserEmailBadge email={userEmail} />
                      </div>
                      {!isDashboard && (
                        <Link
                          href="/dashboard"
                          className="text-slate-300 hover:text-white py-2 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          🚀 Dashboard
                        </Link>
                      )}
                      <Link
                        href="/settings/profile"
                        className="text-slate-300 hover:text-white py-2 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); handleSignOut(); }}
                        className="text-left text-red-400 hover:text-red-300 py-2 transition-colors"
                      >
                        → Sign Out
                      </button>
                    </>
                  ) : (
                    <ShimmerButton
                      size="sm"
                      className="mt-2 w-full justify-center"
                      onClick={() => { setMenuOpen(false); router.push("/login"); }}
                    >
                      Get Started →
                    </ShimmerButton>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
