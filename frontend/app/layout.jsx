import './globals.css';
import { Inter } from 'next/font/google';

// next/font self-hosts Inter — no network request at runtime, preloaded in <head>
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata = {
  title: 'PerFin AI — Personal Finance Copilot',
  description:
    'AI-powered personal finance analyzer. Track wealth, plan goals, and get personalized advice.',
  keywords: ['personal finance', 'AI finance', 'financial health', 'India', 'PerFinAI'],
  openGraph: {
    title: 'PerFin AI — Personal Finance Copilot',
    description: 'AI-powered financial clarity for every Indian.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
