// app/api/dashboard/route.js
// What: Returns everything the dashboard page needs in a single API call.
// Includes: profile targets, today's totals, today's meals, and coaching nudge.
// Usage: GET /api/dashboard?date=YYYY-MM-DD

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

    // 3. Fetch profile and today's data in parallel — faster than sequential fetches
    const [profileResult, dailyLogResult, mealsResult, recentLogsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', date).single(),
      supabase.from('meals').select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${date}T00:00:00.000Z`)
        .lte('logged_at', `${date}T23:59:59.999Z`)
        .order('logged_at', { ascending: true }),
      supabase.from('daily_logs').select('total_calories, log_date')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(3),
    ]);

    const profile = profileResult.data;
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const dailyLog = dailyLogResult.data;
    const meals = mealsResult.data || [];
    const recentLogs = recentLogsResult.data || [];

    // 4. Calculate remaining targets for today
    const totalCalories = dailyLog?.total_calories || 0;
    const totalProtein = parseFloat(dailyLog?.total_protein_g) || 0;
    const totalCarbs = parseFloat(dailyLog?.total_carbs_g) || 0;
    const totalFiber = parseFloat(dailyLog?.total_fiber_g) || 0;

    const remainingCalories = profile.daily_calorie_target - totalCalories;
    const remainingProtein = profile.daily_protein_target_g - totalProtein;
    const remainingCarbs = profile.daily_carbs_target_g - totalCarbs;
    const remainingFiber = profile.daily_fiber_target_g - totalFiber;

    // 5. Generate coaching feedback
    const safetyNudge = checkMultiDaySafety(recentLogs);
    const currentHour = new Date().getHours();

    const feedback = safetyNudge || generateFeedback({
      totalCalories,
      targetCalories: profile.daily_calorie_target,
      totalProtein,
      targetProtein: profile.daily_protein_target_g,
      totalCarbs,
      targetCarbs: profile.daily_carbs_target_g,
      totalFiber,
      targetFiber: profile.daily_fiber_target_g,
      mealsCount: dailyLog?.meals_count || 0,
      currentHour,
      gender: profile.gender,
    });

    // 6. Return everything
    return NextResponse.json({
      profile: {
        name: profile.name,
        daily_calorie_target: profile.daily_calorie_target,
        daily_protein_target_g: profile.daily_protein_target_g,
        daily_carbs_target_g: profile.daily_carbs_target_g,
        daily_fiber_target_g: profile.daily_fiber_target_g,
        estimated_weeks_to_goal: profile.estimated_weeks_to_goal,
      },
      today: {
        total_calories: totalCalories,
        total_protein_g: totalProtein,
        total_carbs_g: totalCarbs,
        total_fiber_g: totalFiber,
        meals_count: dailyLog?.meals_count || 0,
        remaining_calories: remainingCalories,
        remaining_protein_g: remainingProtein,
        remaining_carbs_g: remainingCarbs,
        remaining_fiber_g: remainingFiber,
      },
      meals,
      feedback,
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
