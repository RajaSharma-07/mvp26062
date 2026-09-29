import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'PolarOps — Indian Antarctic Expedition Logistics',
  description: 'Integrated real-time logistics and asset management system for Indian Antarctic expeditions. Track assets, personnel, and emergency incidents across Maitri and Bharati stations.',
  keywords: ['Antarctic', 'expedition', 'logistics', 'NCPOR', 'Maitri', 'Bharati', 'PolarOps'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#080E1A" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🧊</text></svg>" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
