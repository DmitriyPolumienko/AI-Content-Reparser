'use client';

import { motion } from 'framer-motion';
import InfiniteMarquee from '@/components/effects/InfiniteMarquee';

const logos = [
  'TechCrunch',
  'Product Hunt',
  'Indie Hackers',
  'Creator Economy',
  'Content Creators',
  'YouTubers Union',
  'SEO Masters',
  'Digital Nomads',
];

export default function TrustedBy() {
  return (
    <section className="relative py-16 overflow-hidden border-y border-white/5">
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-white/40 uppercase tracking-widest"
        >
          Trusted by creators from
        </motion.p>
      </div>

      <InfiniteMarquee speed={35} className="py-2">
        <div className="flex items-center gap-12">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center gap-2 px-6 py-2 rounded-full glass border border-white/10 whitespace-nowrap"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
              <span className="text-white/50 text-sm font-medium">{logo}</span>
            </div>
          ))}
        </div>
      </InfiniteMarquee>

      {/* Gradient line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </section>
  );
}
