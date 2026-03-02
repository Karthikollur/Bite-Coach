// app/layout.js
// What: The root layout — wraps EVERY page in the app.
// Why: Layout is where we put things shared across all pages: fonts, metadata,
//      global styles. Think of it as the outer shell of the app.

import { Inter } from 'next/font/google';
import './globals.css';

// Inter is a clean, modern font — readable on all screen sizes
const inter = Inter({ subsets: ['latin'] });

// Viewport + theme — Next.js 14 requires these in a SEPARATE export from metadata
// Why separate? Next.js uses this to generate <meta name="viewport"> and <meta name="theme-color">
export const viewport = {
  // Fills the full screen on mobile like a native app; disables pinch-zoom
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Green bar shown in Android Chrome address bar and installed app header
  themeColor: '#16a34a',
};

// Metadata shown in browser tab, search engines, and used by the PWA manifest
export const metadata = {
  title: 'Bite Coach — Your AI Food Coach',
  description: 'Turn food photos into personalized daily coaching. Not just calorie numbers — real guidance to help you reach your goal weight.',
  // PWA manifest link — tells Android Chrome this site is installable
  manifest: '/manifest.json',
  // Apple devices: allow full-screen when added to home screen
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bite Coach',
  },
  // Icons for browser tabs and home screen shortcuts
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* children = whatever page is currently being shown */}
        {children}
      </body>
    </html>
  );
}
