import type { Metadata } from 'next';
import { Inter, Questrial } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { organizationJsonLd, softwareApplicationJsonLd } from '@/lib/jsonld';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const questrial = Questrial({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  ...buildMetadata({ title: 'Offerlane — The free AI agent that applies for you' }),
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = [organizationJsonLd(), softwareApplicationJsonLd()];

  return (
    <html lang="en" className={`${inter.variable} ${questrial.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main-content" className="ol-skip-link">
          Skip to content
        </a>
        {children}
        {jsonLd.map((entry, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
          />
        ))}
      </body>
    </html>
  );
}
