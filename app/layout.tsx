import {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next";
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
  title: '星象塔罗 - AI在线占卜 | 深度解读命运',
  description: 'AI驱动的神秘塔罗牌在线占卜与深度解读。融合阿卡夏记录与现代星象学，为你指引方向。',
  manifest: "/manifest.json",
  applicationName: "星象塔罗",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "星象塔罗",
  },
  openGraph: {
    type: 'website',
    siteName: '星象塔罗',
    title: '星象塔罗 - AI在线占卜',
    description: 'AI驱动的神秘塔罗牌在线占卜与深度解读。',
    images: ['/icon-512x512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '星象塔罗 - AI在线占卜',
    description: 'AI驱动的神秘塔罗牌在线占卜与深度解读。',
    images: ['/icon-512x512.png'],
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
        <Analytics />
      </body>
    </html>
  );
}
