import {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

import { Viewport } from 'next';

export const metadata: Metadata = {
  title: '星象塔罗 - AI在线占卜',
  description: 'AI驱动的神秘塔罗牌在线占卜与深度解读。',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mystic AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#080510",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="text-white min-h-screen font-sans antialiased selection:bg-amber-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
