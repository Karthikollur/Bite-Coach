// app/api/meals/log/route.js
// What: Saves a confirmed meal to the database and updates today's running totals.
// When called: User taps "Save to Log" after reviewing AI analysis results.

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      food_name,
      calories,
      protein_g = 0,
      carbs_g = 0,
      fiber_g = 0,
      meal_type,
      photo_url,
      ai_original_calories,
    } = body;

    // 3. Validate required fields
    if (!food_name || calories === undefined || calories === null) {
      return NextResponse.json(
        { error: 'Food name and calories are required.' },
        { status: 400 }
      );
    }

    if (calories < 0) {
      return NextResponse.json(
        { error: 'Calories cannot be negative.' },
        { status: 400 }
      );
    }

    // 4. Insert the meal into the meals table
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        food_name,
        calories: Math.round(parseFloat(calories)) || 0,
        protein_g: parseFloat(protein_g) || 0,
        carbs_g: parseFloat(carbs_g) || 0,
        fiber_g: parseFloat(fiber_g) || 0,
        meal_type: meal_type || null,
        photo_url: photo_url || null,
        ai_original_calories: ai_original_calories ? Math.round(parseFloat(ai_original_calories)) : null,
        // was_edited = true if the user changed the AI's calorie estimate
        was_edited: ai_original_calories !== undefined && ai_original_calories !== calories,
      })
      .select()
      .single();

    if (mealError) {
      console.error('Meal insert error:', mealError);
      return NextResponse.json({ error: "Couldn't save your meal. Please try again." }, { status: 500 });
    }

    // 5. Update daily_logs — add this meal's values to today's running totals
    // UPSERT: creates a new row for today if it doesn't exist yet, updates it if it does
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD" format

    // First, try to get today's existing log
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single();

    let dailyLog;

    if (existingLog) {
      // Today's log exists — add this meal's values to the running totals
      const { data: updatedLog, error: updateError } = await supabase
        .from('daily_logs')
        .update({
          total_calories: existingLog.total_calories + Math.round(calories),
          total_protein_g: parseFloat(existingLog.total_protein_g) + parseFloat(protein_g || 0),
          total_carbs_g: parseFloat(existingLog.total_carbs_g) + parseFloat(carbs_g || 0),
          total_fiber_g: parseFloat(existingLog.total_fiber_g) + parseFloat(fiber_g || 0),
          meals_count: existingLog.meals_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLog.id)
        .select()
        .single();

      if (updateError) throw updateError;
      dailyLog = updatedLog;
    } else {
      // First meal of the day — create a new daily log row
      const { data: newLog, error: insertError } = await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          log_date: today,
          total_calories: Math.round(calories),
          total_protein_g: parseFloat(protein_g) || 0,
          total_carbs_g: parseFloat(carbs_g) || 0,
          total_fiber_g: parseFloat(fiber_g) || 0,
          meals_count: 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      dailyLog = newLog;
    }

    // 6. Return the saved meal + updated daily totals
    return NextResponse.json(
      {
        meal,
        daily_totals: {
          total_calories: dailyLog.total_calories,
          total_protein_g: dailyLog.total_protein_g,
          total_carbs_g: dailyLog.total_carbs_g,
          total_fiber_g: dailyLog.total_fiber_g,
          meals_count: dailyLog.meals_count,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/meals/log error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
