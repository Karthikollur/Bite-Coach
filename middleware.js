// middleware.js
// What: Runs BEFORE every page load to check if the user is logged in.
// Why: Without this, anyone could access /dashboard or /onboarding without an account.
//      Middleware is Next.js's built-in way to protect routes before they render.

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Pages that do NOT require login (public pages)
const PUBLIC_PATHS = ['/', '/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public pages through without any auth check
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes to handle their own auth (each route checks auth itself)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For all other pages, check if the user is logged in
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client that can read/write cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user session → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but visiting /onboarding → allow through
  // The onboarding page itself handles the redirect to /dashboard after completion
  if (pathname === '/onboarding') {
    return response;
  }

  // For dashboard/profile/log-meal: check if onboarding is completed
  // We do this by checking the profile in Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  // If no profile or onboarding not done → redirect to onboarding
  if (!profile || !profile.onboarding_completed) {
    const onboardingUrl = new URL('/onboarding', request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return response;
}

// Tell Next.js which paths this middleware runs on
// '_next' and 'favicon' are excluded — they're static files, not pages
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
