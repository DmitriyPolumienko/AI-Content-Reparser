"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string; // if no href, it's the current page (not clickable)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className ?? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4"}
    >
      <ol className="flex items-center gap-2 text-sm text-slate-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-600">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-emerald-400 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-300">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
