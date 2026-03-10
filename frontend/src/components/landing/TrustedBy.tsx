"use client";

import { motion } from "framer-motion";
import InfiniteMarquee from "@/components/effects/InfiniteMarquee";

const companies = [
  { name: "TechCrunch", logo: "TC" },
  { name: "Product Hunt", logo: "PH" },
  { name: "Indie Hackers", logo: "IH" },
  { name: "HubSpot", logo: "HS" },
  { name: "Zapier", logo: "ZP" },
  { name: "Notion", logo: "NT" },
  { name: "Webflow", logo: "WF" },
  { name: "Figma", logo: "FG" },
];

export default function TrustedBy() {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Gradient divider top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.4), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-widest"
        >
          Trusted by creators from:
        </motion.p>

        <InfiniteMarquee speed={30}>
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 mx-10 glass px-5 py-2.5 rounded-xl shrink-0"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/50 to-cyan-500/50 flex items-center justify-center text-white font-bold text-xs">
                {company.logo}
              </div>
              <span className="text-slate-400 text-sm font-medium whitespace-nowrap">
                {company.name}
              </span>
            </div>
          ))}
        </InfiniteMarquee>
      </div>

      {/* Gradient divider bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), rgba(6,182,212,0.2), transparent)",
        }}
      />
    </section>
  );
}
