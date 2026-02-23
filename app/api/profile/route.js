// app/api/profile/route.js
// What: GET and PUT endpoints for the user's profile.
// GET: Returns current profile + targets (used by dashboard, profile page)
// PUT: Updates profile data (used by profile settings page to update weight, goals, etc.)

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { calculateTargets } from '@/lib/calories';

// GET /api/profile — Returns the authenticated user's profile
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// PUT /api/profile — Updates profile and recalculates targets if needed
export async function PUT(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      current_weight_kg,
      goal_weight_kg,
      activity_level,
    } = body;

    // Get the current profile to fill in any fields not being updated
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Merge provided values with existing values
    const updatedWeight = current_weight_kg ?? existingProfile.current_weight_kg;
    const updatedGoal = goal_weight_kg ?? existingProfile.goal_weight_kg;
    const updatedActivity = activity_level ?? existingProfile.activity_level;

    // Recalculate targets with updated values
    // Why: If the user loses weight or changes activity, targets should update too
    const targets = calculateTargets({
      gender: existingProfile.gender,
      age: existingProfile.age,
      heightCm: existingProfile.height_cm,
      weightKg: updatedWeight,
      goalWeightKg: updatedGoal,
      activityLevel: updatedActivity,
    });

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        name: name ?? existingProfile.name,
        current_weight_kg: updatedWeight,
        goal_weight_kg: updatedGoal,
        activity_level: updatedActivity,
        ...targets,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
