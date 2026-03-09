import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

const SITE_DESCRIPTION =
  'Transform video transcripts into high-quality content with AI';

export const metadata: Metadata = {
  title: 'AI Content Reparser — Transform Videos into Viral Content',
  description:
    'Convert YouTube videos into SEO articles, LinkedIn posts, and Twitter threads instantly with AI. 10x your content production speed.',
  keywords: ['AI content', 'YouTube to article', 'SEO writer', 'content repurposing', 'GPT-4'],
  openGraph: {
    title: 'AI Content Reparser',
    description: SITE_DESCRIPTION,
    type: 'website',
    siteName: 'AI Content Reparser',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Reparser',
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#030014',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Inter font via Google Fonts CDN for production; gracefully falls back to system-ui */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#030014] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
