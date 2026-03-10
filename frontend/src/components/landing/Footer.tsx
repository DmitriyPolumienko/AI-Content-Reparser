"use client";

import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Login", href: "/login" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      {/* Gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #10B981, #059669, #047857, transparent)",
        }}
      />

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 mb-12">
            {/* Brand */}
            <div className="md:w-72 shrink-0">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-glow">
                  AI
                </div>
                <span className="font-bold text-white text-sm font-display">
                  Content <span className="gradient-text">Reparser</span>
                </span>
              </Link>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Transform videos into SEO-ready content. Powered by GPT-4.1.
              </p>
              <div className="flex gap-3">
                {["𝕏", "in", "▶"].map((icon) => (
                  <a
                    key={icon}
                    href="#"
                    className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xs font-bold"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-4 font-display">Navigation</h4>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-500 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} AI Content Reparser. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Built with{" "}
              <span className="gradient-text font-medium">Next.js + GPT-4.1</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
