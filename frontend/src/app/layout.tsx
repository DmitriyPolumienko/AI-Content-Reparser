import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/effects/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://v2post.io"),
  title: {
    default: "V2Post — Turn YouTube Videos into SEO Articles, LinkedIn Posts & Twitter Threads",
    template: "%s | V2Post",
  },
  description:
    "V2Post uses AI to convert YouTube videos into publication-ready content. Generate SEO articles, LinkedIn posts, and Twitter threads in seconds. Try free today.",
  keywords: [
    "V2Post",
    "YouTube to article",
    "video to blog post",
    "AI content generator",
    "SEO content creator",
    "video repurposing tool",
    "YouTube transcript to article",
    "LinkedIn post generator",
    "Twitter thread generator",
    "GPT-4 content creation",
  ],
  alternates: {
    canonical: "https://v2post.io",
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://v2post.io",
    siteName: "V2Post",
    title: "V2Post — Turn YouTube Videos into SEO Articles, LinkedIn Posts & Twitter Threads",
    description:
      "V2Post uses AI to convert YouTube videos into publication-ready content. Generate SEO articles, LinkedIn posts, and Twitter threads in seconds. Try free today.",
    images: [
      {
        url: "/logo-icon.png",
        width: 512,
        height: 512,
        alt: "V2Post Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "V2Post — Turn YouTube Videos into SEO Articles, LinkedIn Posts & Twitter Threads",
    description:
      "V2Post uses AI to convert YouTube videos into publication-ready content. Generate SEO articles, LinkedIn posts, and Twitter threads in seconds. Try free today.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#030014] text-white antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
