import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Content Reparser — Turn Videos Into SEO Content",
    template: "%s | AI Content Reparser",
  },
  description:
    "Transform YouTube videos into SEO-optimized articles, LinkedIn posts, and Twitter threads in seconds using AI.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-content-reparser.com",
    siteName: "AI Content Reparser",
    title: "AI Content Reparser — Turn Videos Into SEO Content",
    description:
      "Transform YouTube videos into SEO-optimized articles, LinkedIn posts, and Twitter threads in seconds using AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Content Reparser — Turn Videos Into SEO Content",
    description:
      "Transform YouTube videos into SEO-optimized articles, LinkedIn posts, and Twitter threads in seconds using AI.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
