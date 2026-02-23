// app/layout.js
// What: The root layout — wraps EVERY page in the app.
// Why: Layout is where we put things shared across all pages: fonts, metadata,
//      global styles. Think of it as the outer shell of the app.

import { Inter } from 'next/font/google';
import './globals.css';

// Inter is a clean, modern font — readable on all screen sizes
const inter = Inter({ subsets: ['latin'] });

// Metadata shown in browser tab and search engines
export const metadata = {
  title: 'Bite Coach — Your AI Food Coach',
  description: 'Turn food photos into personalized daily coaching. Not just calorie numbers — real guidance to help you reach your goal weight.',
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
