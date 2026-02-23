// app/api/meals/[id]/route.js
// What: Deletes a specific meal and recalculates today's running totals.
// When called: User taps "Remove" on a meal card in the dashboard.
// The [id] in the filename means this route handles /api/meals/ANYTHING

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Meal ID required' }, { status: 400 });
    }

    // 2. Find the meal first to get its values (we need them to subtract from daily totals)
    // We also verify it belongs to this user — RLS would block it anyway, but explicit is better
    const { data: meal, error: findError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Security: ensure meal belongs to this user
      .single();

    if (findError || !meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // 3. Delete the meal
    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Meal delete error:', deleteError);
      return NextResponse.json({ error: "Couldn't delete meal. Please try again." }, { status: 500 });
    }

    // 4. Recalculate today's daily log totals
    // We subtract this meal's values from the running totals
    const mealDate = new Date(meal.logged_at).toISOString().split('T')[0];

    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', mealDate)
      .single();

    if (existingLog) {
      const newCalories = Math.max(0, existingLog.total_calories - meal.calories);
      const newProtein = Math.max(0, parseFloat(existingLog.total_protein_g) - parseFloat(meal.protein_g));
      const newCarbs = Math.max(0, parseFloat(existingLog.total_carbs_g) - parseFloat(meal.carbs_g));
      const newFiber = Math.max(0, parseFloat(existingLog.total_fiber_g) - parseFloat(meal.fiber_g));
      const newCount = Math.max(0, existingLog.meals_count - 1);

      const { data: updatedLog, error: updateError } = await supabase
        .from('daily_logs')
        .update({
          total_calories: newCalories,
          total_protein_g: newProtein,
          total_carbs_g: newCarbs,
          total_fiber_g: newFiber,
          meals_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLog.id)
        .select()
        .single();

      if (updateError) {
        console.error('Daily log update error after delete:', updateError);
        // Meal is already deleted — don't fail the whole request over the log update
      }

      return NextResponse.json({
        message: 'Meal deleted',
        daily_totals: updatedLog ? {
          total_calories: updatedLog.total_calories,
          total_protein_g: updatedLog.total_protein_g,
          total_carbs_g: updatedLog.total_carbs_g,
          total_fiber_g: updatedLog.total_fiber_g,
          meals_count: updatedLog.meals_count,
        } : null,
      });
    }

    return NextResponse.json({ message: 'Meal deleted' });
  } catch (error) {
    console.error('DELETE /api/meals/[id] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
