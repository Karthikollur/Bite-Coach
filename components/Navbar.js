// components/Navbar.js
// What: Top navigation bar — sticky header with logo, date, nav links, user initial, logout.
// Why 'use client': Logout calls supabase.auth.signOut() (browser action) + usePathname hook.

'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function Navbar({ userName }) {
  const router = useRouter();
  const pathname = usePathname();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function isActive(path) {
    return pathname === path;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* ─── Logo + Date ─── */}
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* Gradient "BC" badge — matches the design system */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">BC</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-lg text-gray-900 leading-none">Bite Coach</p>
            <p className="text-xs text-gray-500 mt-0.5">{currentDate}</p>
          </div>
        </Link>

        {/* ─── Nav links + User ─── */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/log-meal"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/log-meal')
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Log meal
          </Link>

          <Link
            href="/profile"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profile')
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Profile
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

          {/* User avatar — shows first letter of name, or a fallback */}
          {userName && (
            <div className="flex items-center gap-2 hidden sm:flex">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                {userName}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
