import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mystic AI',
    short_name: 'Mystic AI',
    description: 'AI-powered Tarot and Astrology readings.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080510',
    theme_color: '#080510',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
