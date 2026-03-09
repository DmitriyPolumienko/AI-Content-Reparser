"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

const testimonials = [
  {
    name: "Alex Martinez",
    handle: "@alexcreates",
    role: "YouTube Creator · 480K subs",
    avatar: "AM",
    avatarColor: "from-blue-500 to-cyan-500",
    text: "I used to spend 4 hours turning each video into a blog post. Now it takes 2 minutes. The SEO articles are genuinely good — I barely have to touch them.",
  },
  {
    name: "Priya Sharma",
    handle: "@priyamarketing",
    role: "Content Strategist · Agency",
    avatar: "PS",
    avatarColor: "from-violet-500 to-pink-500",
    text: "We repurpose all our clients' podcasts and webinars with this tool. The LinkedIn posts it generates get 3× more engagement than what we wrote manually.",
  },
  {
    name: "Tom Fischer",
    handle: "@tomtechtalk",
    role: "Tech Blogger · 200K newsletter",
    avatar: "TF",
    avatarColor: "from-emerald-500 to-teal-500",
    text: "The Twitter thread format is exceptional. It nails the hook, the pacing, and the CTA every single time. My follower growth has doubled since I started.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-slate-900/40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">top creators</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Join thousands of creators who save hours every week with AI Content Reparser.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={cardVariants}>
              <Card hover className="h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
