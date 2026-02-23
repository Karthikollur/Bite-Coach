// lib/supabase-server.js
// What: Creates a Supabase client for use on the server (API routes, server components).
// Why: The server client reads the user's auth cookie to identify who's making the request.
//      This is how we know which user's data to return without exposing their password.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  // cookies() reads the HTTP cookie sent with every browser request.
  // Supabase stores the session token in a cookie after login.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can throw in Server Components — that's fine to ignore.
            // The cookie will be set by middleware on the next request.
          }
        },
      },
    }
  );
}
