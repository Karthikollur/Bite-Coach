// app/api/feedback/route.js
// What: Generates a personalized coaching nudge based on today's intake vs targets.
// Usage: GET /api/feedback?date=YYYY-MM-DD
// Called from the dashboard after meals are loaded.

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { generateFeedback, checkMultiDaySafety } from '@/lib/feedback';

export async function GET(request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 3. Fetch user's profile (for targets and gender)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('daily_calorie_target, daily_protein_target_g, daily_carbs_target_g, daily_fiber_target_g, gender')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 4. Fetch today's daily log (actual intake)
    const { data: dailyLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', date)
      .single();

    // 5. Check multi-day safety (if <1000 cal for 3+ days → critical warning)
    const { data: recentLogs } = await supabase
      .from('daily_logs')
      .select('total_calories, log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(3);

    const safetyNudge = checkMultiDaySafety(recentLogs);
    if (safetyNudge) {
      return NextResponse.json(safetyNudge);
    }

    // 6. Generate the coaching nudge
    // If no meals logged today, use zeros
    const currentHour = new Date().getHours();
    const feedback = generateFeedback({
      totalCalories: dailyLog?.total_calories || 0,
      targetCalories: profile.daily_calorie_target,
      totalProtein: parseFloat(dailyLog?.total_protein_g) || 0,
      targetProtein: profile.daily_protein_target_g,
      totalCarbs: parseFloat(dailyLog?.total_carbs_g) || 0,
      targetCarbs: profile.daily_carbs_target_g,
      totalFiber: parseFloat(dailyLog?.total_fiber_g) || 0,
      targetFiber: profile.daily_fiber_target_g,
      mealsCount: dailyLog?.meals_count || 0,
      currentHour,
      gender: profile.gender,
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('GET /api/feedback error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
