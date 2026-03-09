'use client';

import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin } from 'lucide-react';

const links = {
  Product: ['Features', 'Pricing', 'Dashboard', 'API'],
  Resources: ['Blog', 'Documentation', 'Changelog', 'Status'],
  Company: ['About', 'Careers', 'Contact', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/8 bg-black/30">
      {/* Gradient accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">AIReparser</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-4">
              Transform video transcripts into high-quality content with AI.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-violet-500/50 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} AI Content Reparser. All rights reserved.
          </p>
          <p className="text-sm text-white/30">
            Built with ❤️ for content creators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
