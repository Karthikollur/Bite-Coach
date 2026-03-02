// next.config.mjs
// What: Next.js configuration with PWA (Progressive Web App) support.
// Why: withPWA wraps the build and auto-generates a service worker.
//      The service worker caches assets so the app works offline and
//      lets Android users install it on their home screen.

import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',          // Service worker files go into public/
  cacheOnFrontEndNav: true, // Cache pages as the user navigates
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,    // Auto-reload when connection comes back
  disable: process.env.NODE_ENV === 'development', // No SW in dev mode (avoids confusion)
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
