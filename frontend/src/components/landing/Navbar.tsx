"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerButton from "@/components/effects/ShimmerButton";

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
  wordsRemaining?: number;
  onStartOver?: () => void;
}

export default function Navbar({ variant = "landing", wordsRemaining, onStartOver }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const isDashboard = variant === "dashboard";
  const navLinks = isDashboard ? dashboardNavLinks : landingNavLinks;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
          <img src="/icon.svg" alt="V2Post Logo" width={32} height={32} className="rounded-lg shadow-glow" />
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

        {/* Desktop right-side content */}
        <div className="hidden md:flex items-center gap-3">
          {isDashboard ? (
            <>
              <div className="px-3 py-1.5 glass rounded-full text-xs text-slate-400">
                Words remaining:{" "}
                <span className="text-emerald-400 font-semibold">
                  {(wordsRemaining ?? 0).toLocaleString()}
                </span>
              </div>
              <button
                onClick={onStartOver}
                className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
              >
                ↺ Start Over
              </button>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <ShimmerButton size="sm" onClick={() => router.push("/dashboard")}>
                Get Started →
              </ShimmerButton>
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
              {isDashboard ? (
                <>
                  <div className="px-3 py-1.5 glass rounded-full text-xs text-slate-400 text-center">
                    Words remaining:{" "}
                    <span className="text-emerald-400 font-semibold">
                      {(wordsRemaining ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); onStartOver?.(); }}
                    className="text-sm text-slate-500 hover:text-emerald-400 transition-colors py-2"
                  >
                    ↺ Start Over
                  </button>
                </>
              ) : (
                <ShimmerButton
                  size="sm"
                  className="mt-2 w-full justify-center"
                  onClick={() => { setMenuOpen(false); router.push("/dashboard"); }}
                >
                  Get Started →
                </ShimmerButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
