// app/api/profile/setup/route.js
// What: Saves onboarding data and calculates personal calorie/macro targets.
// When called: User submits the onboarding form.

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { calculateTargets } from '@/lib/calories';

export async function POST(request) {
  try {
    // 1. Check authentication — get the logged-in user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse the request body
    const body = await request.json();
    const {
      name,
      gender,
      age,
      height_cm,
      current_weight_kg,
      goal_weight_kg,
      activity_level,
    } = body;

    // 3. Validate required fields
    if (!gender || !age || !height_cm || !current_weight_kg || !goal_weight_kg || !activity_level) {
      return NextResponse.json(
        { error: 'All fields are required: gender, age, height, current weight, goal weight, activity level' },
        { status: 400 }
      );
    }

    // Validate field values
    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json({ error: 'Gender must be male or female' }, { status: 400 });
    }

    const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    if (!validActivityLevels.includes(activity_level)) {
      return NextResponse.json({ error: 'Invalid activity level' }, { status: 400 });
    }

    if (age < 15 || age > 100) {
      return NextResponse.json({ error: 'Age must be between 15 and 100' }, { status: 400 });
    }

    // 4. Calculate personalized targets using Mifflin-St Jeor formula
    // This is done server-side so users can't manipulate the calculation
    const targets = calculateTargets({
      gender,
      age,
      heightCm: height_cm,
      weightKg: current_weight_kg,
      goalWeightKg: goal_weight_kg,
      activityLevel: activity_level,
    });

    // 5. Save to the profiles table (upsert = insert if new, update if exists)
    // Using upsert so re-onboarding doesn't fail with "row already exists"
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,              // Profile ID must match Auth user ID
        email: user.email,
        name: name || null,
        gender,
        age,
        height_cm,
        current_weight_kg,
        goal_weight_kg,
        activity_level,
        ...targets,               // Spread in all calculated values
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json(
        { error: 'Failed to save your profile. Please try again.' },
        { status: 500 }
      );
    }

    // 6. Return the calculated targets so the onboarding page can show them
    return NextResponse.json(
      {
        profile: {
          daily_calorie_target: profile.daily_calorie_target,
          daily_protein_target_g: profile.daily_protein_target_g,
          daily_carbs_target_g: profile.daily_carbs_target_g,
          daily_fiber_target_g: profile.daily_fiber_target_g,
          estimated_weeks_to_goal: profile.estimated_weeks_to_goal,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/profile/setup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
