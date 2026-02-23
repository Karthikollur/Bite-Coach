// app/api/meals/route.js
// What: Fetches all meals for the authenticated user on a given date.
// Usage: GET /api/meals?date=YYYY-MM-DD
// If no date is provided, defaults to today.

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get the date from query params (e.g., ?date=2026-02-21)
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 3. Fetch meals for that date
    // logged_at is a timestamp, so we need to query a range: start of day to end of day
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', dayStart)
      .lte('logged_at', dayEnd)
      .order('logged_at', { ascending: true });

    if (mealsError) {
      console.error('Meals fetch error:', mealsError);
      return NextResponse.json({ error: 'Failed to fetch meals.' }, { status: 500 });
    }

    return NextResponse.json({ meals: meals || [] });
  } catch (error) {
    console.error('GET /api/meals error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
