// lib/supabase-client.js
// What: Creates a Supabase client for use in the browser (client components).
// Why: We need two separate clients — one for the browser, one for the server.
//      This browser client uses the anon key and respects Row Level Security (RLS).
//      RLS means users can ONLY see their own data — security is enforced by the database.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // NEXT_PUBLIC_ prefix means this key is safe to expose in the browser.
  // The anon key has limited permissions — RLS policies restrict what it can do.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
