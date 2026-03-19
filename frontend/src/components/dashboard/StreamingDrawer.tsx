"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/effects/Toast";

interface StreamingDrawerProps {
  isOpen: boolean;
  isStreaming: boolean;
  content: string;
  onClose: () => void;
}

type ViewMode = "clean" | "raw";
type DownloadFormat = "txt" | "csv" | "html";

function SkeletonLine({ width }: { width: string }) {
  return (
    <div className="h-3 rounded-full bg-white/10 animate-pulse" style={{ width }} />
  );
}

const SKELETON_WIDTHS = ["85%", "92%", "78%", "88%", "65%", "90%", "72%", "80%", "60%", "87%"];
const TWITTER_CHAR_LIMIT = 280;

function tryParseJson(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* streaming in progress */
  }
  return null;
}

function detectContentType(data: Record<string, unknown>) {
  if ("sections" in data) return "seo_article";
  if ("tweets" in data) return "twitter_thread";
  if ("hook" in data && "body" in data) return "linkedin_post";
  if ("key_takeaways" in data) return "video_recap";
  return "unknown";
}

function CleanContentView({ content }: { content: string }) {
  const data = tryParseJson(content);
  if (!data) {
    return (
      <pre className="text-[#e6edf3] text-[13px] leading-[1.7] whitespace-pre-wrap font-mono">
        {content}
      </pre>
    );
  }

  const type = detectContentType(data);

  if (type === "seo_article") {
    const title = data.title as string | undefined;
    const meta = data.meta_description as string | undefined;
    const sections = (data.sections as Array<{
      heading_level?: string; heading?: string; content?: string; list?: string[];
    }>) || [];
    const faq = (data.faq as Array<{ question: string; answer: string }>) || [];
    const cta = data.cta as string | undefined;
    return (
      <div className="space-y-5 text-[#e6edf3]">
        {title && <h1 className="text-xl font-bold text-white leading-snug">{title}</h1>}
        {meta && <p className="text-sm text-slate-400 italic border-l-2 border-[#30363d] pl-3">{meta}</p>}
        {sections.map((sec, i) => {
          const HeadingTag = (sec.heading_level === "H3" ? "h3" : "h2") as "h2" | "h3";
          const headingClass = HeadingTag === "h2"
            ? "text-base font-semibold text-white mt-5 mb-1"
            : "text-sm font-semibold text-slate-200 mt-4 mb-1";
          return (
            <div key={i} className="space-y-2">
              {sec.heading && <HeadingTag className={headingClass}>{sec.heading}</HeadingTag>}
              {sec.content && (
                <div className="space-y-2">
                  {sec.content.split("\n").filter(Boolean).map((para, j) => (
                    <p key={j} className="text-sm text-slate-300 leading-relaxed">{para}</p>
                  ))}
                </div>
              )}
              {sec.list && sec.list.length > 0 && (
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {sec.list.map((item, j) => (
                    <li key={j} className="text-sm text-slate-300">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {faq.length > 0 && (
          <div className="space-y-3 mt-4">
            <h2 className="text-base font-semibold text-white">FAQ</h2>
            {faq.map((pair, i) => (
              <div key={i} className="space-y-0.5">
                <p className="text-sm font-medium text-slate-200">Q: {pair.question}</p>
                <p className="text-sm text-slate-400">A: {pair.answer}</p>
              </div>
            ))}
          </div>
        )}
        {cta && (
          <div className="mt-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-sm text-emerald-300 font-medium">{cta}</p>
          </div>
        )}
      </div>
    );
  }

  if (type === "linkedin_post") {
    const hook = data.hook as string | undefined;
    const body = (data.body as string[]) || [];
    const listData = data.list as { items?: string[] } | string[] | undefined;
    const listItems: string[] = Array.isArray(listData) ? listData : listData?.items ?? [];
    const ctaQuestion = data.cta_question as string | undefined;
    const hashtags = (data.hashtags as string[]) || [];
    return (
      <div className="space-y-4 text-[#e6edf3]">
        {hook && <p className="text-base font-semibold text-white leading-snug">{hook}</p>}
        {body.map((para, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">{para}</p>
        ))}
        {listItems.length > 0 && (
          <ul className="space-y-1 pl-1">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm text-slate-300">{item}</li>
            ))}
          </ul>
        )}
        {ctaQuestion && <p className="text-sm text-slate-200 font-medium italic">{ctaQuestion}</p>}
        {hashtags.length > 0 && <p className="text-xs text-blue-400">{hashtags.join(" ")}</p>}
      </div>
    );
  }

  if (type === "twitter_thread") {
    const tweets = (data.tweets as Array<{ num: number; text: string }>) || [];
    return (
      <div className="space-y-3">
        {tweets.map((tweet, i) => (
          <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 leading-relaxed">
            {tweet.text}
          </div>
        ))}
      </div>
    );
  }

  if (type === "video_recap") {
    const title = data.title as string | undefined;
    const summary = data.summary as string | undefined;
    const keyTakeaways = (data.key_takeaways as string[]) || [];
    const quotes = (data.quotes as string[]) || [];
    const recommendations = (data.recommendations as string[]) || [];
    const hashtags = (data.hashtags as string[]) || [];
    return (
      <div className="space-y-5 text-[#e6edf3]">
        {title && <h1 className="text-xl font-bold text-white leading-snug">{title}</h1>}
        {summary && (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-slate-300 leading-relaxed italic">{summary}</p>
          </div>
        )}
        {keyTakeaways.length > 0 && (
          <div className="space-y-2">
            <ul className="space-y-1.5">
              {keyTakeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {quotes.length > 0 && (
          <div className="space-y-2">
            {quotes.map((quote, i) => (
              <blockquote key={i} className="border-l-2 border-emerald-500/40 pl-3 text-sm text-slate-400 italic">
                {quote}
              </blockquote>
            ))}
          </div>
        )}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <ul className="space-y-1.5">
              {recommendations.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hashtags.length > 0 && <p className="text-xs text-blue-400">{hashtags.join(" ")}</p>}
      </div>
    );
  }

  return (
    <pre className="text-[#e6edf3] text-[13px] leading-[1.7] whitespace-pre-wrap font-mono">
      {content}
    </pre>
  );
}

function buildCleanText(content: string): string {
  const data = tryParseJson(content);
  if (!data) return content;
  const type = detectContentType(data);
  const lines: string[] = [];
  if (type === "seo_article") {
    if (data.title) lines.push(data.title as string, "");
    if (data.meta_description) lines.push(data.meta_description as string, "");
    const sections = (data.sections as Array<{ heading?: string; content?: string; list?: string[] }>) || [];
    for (const sec of sections) {
      if (sec.heading) lines.push("## " + sec.heading);
      if (sec.content) lines.push(sec.content, "");
      if (sec.list?.length) { lines.push(...sec.list.map((i) => "- " + i), ""); }
    }
    const faq = (data.faq as Array<{ question: string; answer: string }>) || [];
    if (faq.length) {
      lines.push("## FAQ", "");
      for (const pair of faq) { lines.push("Q: " + pair.question, "A: " + pair.answer, ""); }
    }
    if (data.cta) lines.push(data.cta as string);
  } else if (type === "linkedin_post") {
    if (data.hook) lines.push(data.hook as string, "");
    for (const p of (data.body as string[]) || []) lines.push(p, "");
    const listData = data.list as { items?: string[] } | string[] | undefined;
    const items: string[] = Array.isArray(listData) ? listData : listData?.items ?? [];
    for (const item of items) lines.push(item);
    if (items.length) lines.push("");
    if (data.cta_question) lines.push(data.cta_question as string, "");
    if ((data.hashtags as string[])?.length) lines.push((data.hashtags as string[]).join(" "));
  } else if (type === "twitter_thread") {
    for (const t of (data.tweets as Array<{ text: string }>) || []) lines.push(t.text, "");
  } else if (type === "video_recap") {
    if (data.title) lines.push(data.title as string, "");
    if (data.summary) lines.push(data.summary as string, "");
    const takeaways = (data.key_takeaways as string[]) || [];
    if (takeaways.length) {
      lines.push("## Key Takeaways", "");
      for (const item of takeaways) lines.push("→ " + item);
      lines.push("");
    }
    const quotes = (data.quotes as string[]) || [];
    if (quotes.length) {
      lines.push("## Notable Quotes", "");
      for (const q of quotes) lines.push('"' + q + '"', "");
    }
    const recs = (data.recommendations as string[]) || [];
    if (recs.length) {
      lines.push("## Recommendations", "");
      recs.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
      lines.push("");
    }
    if ((data.hashtags as string[])?.length) lines.push((data.hashtags as string[]).join(" "));
  } else { return content; }
  return lines.join("\n");
}

function buildCsv(content: string): string {
  const data = tryParseJson(content);
  if (!data) return "content\n\"" + content.replace(/"/g, '""') + "\"";
  const type = detectContentType(data);
  const rows: string[][] = [];
  const esc = (s: unknown) => '"' + String(s ?? "").replace(/"/g, '""') + '"';
  if (type === "seo_article") {
    rows.push(["title","meta_description","section_heading","section_content","list_items","faq_question","faq_answer","cta","keywords"]);
    const title = (data.title as string) ?? "";
    const meta = (data.meta_description as string) ?? "";
    const cta = (data.cta as string) ?? "";
    const keywords = ((data.keywords_used as string[]) ?? []).join("; ");
    const sections = (data.sections as Array<{ heading?: string; content?: string; list?: string[] }>) || [];
    const faq = (data.faq as Array<{ question: string; answer: string }>) || [];
    const maxRows = Math.max(sections.length, faq.length, 1);
    for (let i = 0; i < maxRows; i++) {
      const sec = sections[i]; const faqItem = faq[i];
      rows.push([i===0?title:"", i===0?meta:"", sec?.heading??"", sec?.content??"", (sec?.list??[]).join("; "), faqItem?.question??"", faqItem?.answer??"", i===0?cta:"", i===0?keywords:""]);
    }
  } else if (type === "linkedin_post") {
    rows.push(["hook","body_paragraph","list_item","cta_question","hashtags","keywords"]);
    const hook = (data.hook as string) ?? "";
    const body = (data.body as string[]) ?? [];
    const listData = data.list as { items?: string[] } | string[] | undefined;
    const listItems: string[] = Array.isArray(listData) ? listData : listData?.items ?? [];
    const ctaQ = (data.cta_question as string) ?? "";
    const hashtags = ((data.hashtags as string[]) ?? []).join("; ");
    const keywords = ((data.keywords_used as string[]) ?? []).join("; ");
    const maxRows = Math.max(body.length, listItems.length, 1);
    for (let i = 0; i < maxRows; i++) {
      rows.push([i===0?hook:"", body[i]??"", listItems[i]??"", i===0?ctaQ:"", i===0?hashtags:"", i===0?keywords:""]);
    }
  } else if (type === "twitter_thread") {
    rows.push(["tweet_num","tweet_text","keywords"]);
    const tweets = (data.tweets as Array<{ num: number; text: string }>) || [];
    const keywords = ((data.keywords_used as string[]) ?? []).join("; ");
    tweets.forEach((t, i) => { rows.push([String(t.num??i+1), t.text??"", i===0?keywords:""]); });
  } else if (type === "video_recap") {
    rows.push(["title","summary","key_takeaway","quote","recommendation","hashtags","keywords"]);
    const title = (data.title as string) ?? "";
    const summary = (data.summary as string) ?? "";
    const takeaways = (data.key_takeaways as string[]) ?? [];
    const quotes = (data.quotes as string[]) ?? [];
    const recs = (data.recommendations as string[]) ?? [];
    const hashtags = ((data.hashtags as string[]) ?? []).join("; ");
    const keywords = ((data.keywords_used as string[]) ?? []).join("; ");
    const maxRows = Math.max(takeaways.length, quotes.length, recs.length, 1);
    for (let i = 0; i < maxRows; i++) {
      rows.push([i===0?title:"", i===0?summary:"", takeaways[i]??"", quotes[i]??"", recs[i]??"", i===0?hashtags:"", i===0?keywords:""]);
    }
  } else { rows.push(["content"]); rows.push([content]); }
  return rows.map((row) => row.map((cell) => esc(String(cell))).join(",")).join("\n");
}

function buildEmbeddedHtml(content: string, isRaw: boolean): string {
  const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (isRaw) {
    return `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Generated Content</title></head>\n<body>\n<pre style="white-space:pre-wrap;font-family:monospace">${esc(content)}</pre>\n</body>\n</html>`;
  }
  const data = tryParseJson(content);
  if (!data) {
    return `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Generated Content</title></head>\n<body>\n<p>${esc(content)}</p>\n</body>\n</html>`;
  }
  const type = detectContentType(data);
  let body = "";
  if (type === "seo_article") {
    const title = (data.title as string) ?? "";
    const meta = (data.meta_description as string) ?? "";
    const sections = (data.sections as Array<{ heading_level?: string; heading?: string; content?: string; list?: string[] }>) || [];
    const faq = (data.faq as Array<{ question: string; answer: string }>) || [];
    const cta = (data.cta as string) ?? "";
    if (title) body += `<h1>${title}</h1>\n`;
    if (meta) body += `<p class="meta-description"><em>${meta}</em></p>\n`;
    for (const sec of sections) {
      const tag = sec.heading_level === "H3" ? "h3" : "h2";
      if (sec.heading) body += `<${tag}>${sec.heading}</${tag}>\n`;
      if (sec.content) { for (const p of sec.content.split("\n").filter(Boolean)) body += `<p>${p}</p>\n`; }
      if (sec.list?.length) body += "<ul>\n" + sec.list.map((i) => "  <li>" + i + "</li>").join("\n") + "\n</ul>\n";
    }
    if (faq.length) {
      body += `<section class="faq"><h2>FAQ</h2>\n`;
      for (const p of faq) body += `<div class="faq-item"><p><strong>${p.question}</strong></p><p>${p.answer}</p></div>\n`;
      body += `</section>\n`;
    }
    if (cta) body += `<div class="cta"><p>${cta}</p></div>\n`;
  } else if (type === "linkedin_post") {
    const hook = (data.hook as string) ?? "";
    const listData = data.list as { items?: string[] } | string[] | undefined;
    const listItems: string[] = Array.isArray(listData) ? listData : listData?.items ?? [];
    const ctaQ = (data.cta_question as string) ?? "";
    const hashtags = (data.hashtags as string[]) ?? [];
    if (hook) body += `<p class="hook"><strong>${hook}</strong></p>\n`;
    for (const p of (data.body as string[]) ?? []) body += `<p>${p}</p>\n`;
    if (listItems.length) body += "<ul>\n" + listItems.map((i) => "  <li>" + i + "</li>").join("\n") + "\n</ul>\n";
    if (ctaQ) body += `<p class="cta-question"><em>${ctaQ}</em></p>\n`;
    if (hashtags.length) body += `<p class="hashtags">${hashtags.join(" ")}</p>\n`;
  } else if (type === "twitter_thread") {
    body += `<div class="twitter-thread">\n`;
    for (const t of (data.tweets as Array<{ text: string }>) || []) body += `<div class="tweet"><p>${t.text}</p></div>\n`;
    body += `</div>\n`;
  } else if (type === "video_recap") {
    const title = (data.title as string) ?? "";
    const summary = (data.summary as string) ?? "";
    const takeaways = (data.key_takeaways as string[]) ?? [];
    const quotes = (data.quotes as string[]) ?? [];
    const recs = (data.recommendations as string[]) ?? [];
    const hashtags = (data.hashtags as string[]) ?? [];
    if (title) body += `<h1>${title}</h1>\n`;
    if (summary) body += `<p class="summary"><em>${summary}</em></p>\n`;
    if (takeaways.length) {
      body += `<h2>Key Takeaways</h2>\n<ul>\n`;
      for (const item of takeaways) body += `  <li>${item}</li>\n`;
      body += `</ul>\n`;
    }
    if (quotes.length) {
      body += `<h2>Notable Quotes</h2>\n`;
      for (const q of quotes) body += `<blockquote>${q}</blockquote>\n`;
    }
    if (recs.length) {
      body += `<h2>Recommendations</h2>\n<ol>\n`;
      for (const r of recs) body += `  <li>${r}</li>\n`;
      body += `</ol>\n`;
    }
    if (hashtags.length) body += `<p class="hashtags">${hashtags.join(" ")}</p>\n`;
  } else { body += `<p>${esc(content)}</p>\n`; }
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Generated Content</title>\n  <style>\n    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 800px; margin: 40px auto; padding: 0 20px; }\n    h1 { font-size: 1.8em; margin-bottom: 0.5em; }\n    h2 { font-size: 1.3em; margin-top: 1.5em; }\n    h3 { font-size: 1.1em; margin-top: 1.2em; }\n    p { margin: 0.6em 0; }\n    ul { margin: 0.8em 0; padding-left: 1.5em; }\n    .meta-description { color: #555; font-style: italic; }\n    .faq { border-top: 1px solid #e0e0e0; padding-top: 1em; margin-top: 2em; }\n    .faq-item { margin-bottom: 1em; }\n    .cta { background: #f0f8ff; border-left: 4px solid #0070f3; padding: 0.8em 1em; margin-top: 1.5em; }\n    .cta-question { font-style: italic; color: #333; }\n    .hashtags { color: #0070f3; }\n    .tweet { border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; margin-bottom: 10px; }\n  </style>\n</head>\n<body>\n${body}</body>\n</html>`;
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function StreamingDrawer({ isOpen, isStreaming, content, onClose }: StreamingDrawerProps) {
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("clean");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  // Auto-expand when new content starts streaming
  useEffect(() => {
    if (isStreaming) setCollapsed(false);
  }, [isStreaming]);

  useEffect(() => {
    if (!shareOpen) return;
    let timerId: ReturnType<typeof setTimeout>;
    const handler = () => setShareOpen(false);
    timerId = setTimeout(() => { document.addEventListener("click", handler); }, 0);
    return () => { clearTimeout(timerId); document.removeEventListener("click", handler); };
  }, [shareOpen]);

  useEffect(() => {
    if (!downloadOpen) return;
    let timerId: ReturnType<typeof setTimeout>;
    const handler = () => setDownloadOpen(false);
    timerId = setTimeout(() => { document.addEventListener("click", handler); }, 0);
    return () => { clearTimeout(timerId); document.removeEventListener("click", handler); };
  }, [downloadOpen]);

  const handleCopy = async () => {
    const text = viewMode === "clean" ? buildCleanText(content) : content;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch { showToast("Failed to copy", "error"); }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: "Generated Content", text: buildCleanText(content) }).catch(() => {});
    } else { setShareOpen((prev) => !prev); }
  };

  const handleShareVia = (platform: "twitter" | "linkedin" | "copy") => {
    setShareOpen(false);
    if (platform === "copy") { handleCopy(); return; }
    const encoded = encodeURIComponent(buildCleanText(content).slice(0, TWITTER_CHAR_LIMIT));
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  const handleDownload = (format: DownloadFormat) => {
    setDownloadOpen(false);
    if (format === "txt") {
      triggerDownload("generated-content.txt", viewMode === "clean" ? buildCleanText(content) : content, "text/plain");
      showToast("Downloaded as TXT!", "success");
    } else if (format === "csv") {
      triggerDownload("generated-content.csv", buildCsv(content), "text/csv");
      showToast("Downloaded as CSV!", "success");
    } else if (format === "html") {
      triggerDownload("generated-content.html", buildEmbeddedHtml(content, viewMode === "raw"), "text/html");
      showToast("Downloaded as HTML!", "success");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="streaming-drawer"
          initial={{ width: 0, opacity: 0 }}
          // Leave at least ~220px for the main content column when drawer is open
          animate={{ width: collapsed ? 48 : "min(820px, calc(100vw - 220px))", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 h-full overflow-hidden rounded-2xl"
          style={{ minWidth: 0 }}
        >
          {/* Collapsed tab strip — only arrow icon */}
          {collapsed ? (
            <div className="w-12 h-full flex flex-col items-center pt-4 gap-3 bg-white/[0.03] border border-white/10 rounded-2xl">
              <button
                onClick={() => setCollapsed(false)}
                title="Expand output panel"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 transition-all"
                aria-label="Expand output panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              {(isStreaming || content) && (
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full mx-auto ${isStreaming ? "bg-yellow-400" : "bg-emerald-400"}`} />
                  {isStreaming && <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-60" />}
                </div>
              )}
            </div>
          ) : (
            <div
              className="h-full flex flex-col border border-white/10 relative rounded-2xl overflow-hidden"
              style={{ width: "min(820px, calc(100vw - 220px))", background: "rgba(5, 3, 25, 0.97)", backdropFilter: "blur(24px)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-0 border-b border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-2.5 px-4 py-3 border-r border-white/10 border-b-2 border-b-emerald-500/60 -mb-px">
                  <div className="relative flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-yellow-400" : "bg-emerald-400"}`} />
                    {isStreaming && <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-60" />}
                  </div>
                  <span className="text-sm font-semibold text-white whitespace-nowrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {isStreaming ? (content ? "Generating…" : "Analyzing…") : "Output"}
                  </span>
                  {!isStreaming && content && (
                    <span className="text-xs text-slate-500 font-mono">{content.length.toLocaleString()} chars</span>
                  )}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-1 px-3">
                  {!isStreaming && content && (
                    <>
                      {/* View mode toggle */}
                      <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 mr-1">
                        <button onClick={() => setViewMode("clean")} title="Clean view"
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "clean" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-500 hover:text-slate-300"}`}>
                          Clean
                        </button>
                        <button onClick={() => setViewMode("raw")} title="Raw JSON view"
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "raw" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                          JSON
                        </button>
                      </div>
                      {/* Copy */}
                      <button onClick={handleCopy} title="Copy to clipboard"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/8 border border-transparent hover:border-white/10 rounded-lg transition-all">
                        {copied ? (
                          <><svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg><span className="text-emerald-400">Copied!</span></>
                        ) : (
                          <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                        )}
                      </button>
                      {/* Share */}
                      <div className="relative">
                        <button onClick={handleShare} title="Share"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/8 border border-transparent hover:border-white/10 rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          Share
                        </button>
                        <AnimatePresence>
                          {shareOpen && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }} onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 w-44 bg-[#0a0a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                              <button onClick={() => handleShareVia("twitter")} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.256 5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                Share on X
                              </button>
                              <button onClick={() => handleShareVia("linkedin")} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                Share on LinkedIn
                              </button>
                              <div className="border-t border-white/10" />
                              <button onClick={() => handleShareVia("copy")} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copy content
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Download */}
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setDownloadOpen((p) => !p); }} title="Download"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/8 border border-transparent hover:border-white/10 rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                          <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <AnimatePresence>
                          {downloadOpen && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }} onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 w-56 bg-[#0a0a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                              <div className="px-3 py-1.5 border-b border-white/10">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Export format</p>
                              </div>
                              <button onClick={() => handleDownload("txt")} className="flex items-start gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                <span className="text-base leading-none mt-px">&#x1F4C4;</span>
                                <div><p className="font-medium">Plain Text (.txt)</p><p className="text-slate-500 text-[10px] mt-0.5">{viewMode === "clean" ? "Formatted text from Clean view" : "Raw JSON string"}</p></div>
                              </button>
                              <button onClick={() => handleDownload("csv")} className="flex items-start gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                <span className="text-base leading-none mt-px">&#x1F4CA;</span>
                                <div><p className="font-medium">Spreadsheet (.csv)</p><p className="text-slate-500 text-[10px] mt-0.5">All structured fields as best-practice columns</p></div>
                              </button>
                              <button onClick={() => handleDownload("html")} className="flex items-start gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                <span className="text-base leading-none mt-px">&#x1F310;</span>
                                <div><p className="font-medium">Embedded HTML (.html)</p><p className="text-slate-500 text-[10px] mt-0.5">{viewMode === "clean" ? "Ready to paste into WordPress / CMS" : "JSON inside &lt;pre&gt; block"}</p></div>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                    </>
                  )}
                  {/* Collapse button */}
                  <button
                    onClick={() => setCollapsed(true)}
                    title="Collapse panel"
                    className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/8"
                    aria-label="Collapse panel"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                  {/* Close button */}
                  <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/8" aria-label="Close panel">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Content area — scrolls internally only */}
              <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
                {/* Analyzing loader — shown when streaming but no content yet */}
                {isStreaming && !content && (
                  <div className="flex flex-col items-center justify-center py-16 px-8 gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 rounded-2xl border border-emerald-500/30 animate-ping opacity-30" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-slate-200">Analyzing content…</p>
                      <p className="text-xs text-slate-500">AI is processing your transcript</p>
                    </div>
                    <div className="w-full max-w-xs space-y-2.5">
                      {SKELETON_WIDTHS.slice(0, 6).map((w, i) => (
                        <SkeletonLine key={i} width={w} />
                      ))}
                    </div>
                  </div>
                )}
                {content && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6">
                    {viewMode === "clean" ? <CleanContentView content={content} /> : (
                      <pre className="text-slate-300 text-[13px] leading-[1.7] whitespace-pre-wrap font-mono">{content}</pre>
                    )}
                    {isStreaming && <span className="inline-block w-0.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />}
                  </motion.div>
                )}
              </div>

              {/* Footer status bar */}
              <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!isStreaming && content ? (
                    <span className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Generation complete
                    </span>
                  ) : isStreaming ? (
                    <span className="text-xs text-yellow-400 flex items-center gap-1.5">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      {content ? "Streaming…" : "Analyzing…"}
                    </span>
                  ) : null}
                </div>
                {content && <span className="text-xs text-slate-500 font-mono">{content.length.toLocaleString()} chars</span>}
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
