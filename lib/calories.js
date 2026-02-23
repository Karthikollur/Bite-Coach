// lib/calories.js
// What: Calculates personalized calorie and macro targets using the Mifflin-St Jeor formula.
// Why: Mifflin-St Jeor is more accurate than Harris-Benedict for modern populations.

import {
  ACTIVITY_MULTIPLIERS,
  MIN_CALORIES_FEMALE,
  MIN_CALORIES_MALE,
  MACRO_RATIOS,
  CALORIES_PER_GRAM,
  DAILY_DEFICIT_CAL,
  WEEKLY_LOSS_KG,
} from '@/lib/constants';

/**
 * Calculate Basal Metabolic Rate (BMR) — calories burned at complete rest.
 * Formula: Mifflin-St Jeor
 * Male:   (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 * Female: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 */
function calculateBMR({ gender, age, heightCm, weightKg }) {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE) — actual daily calorie burn.
 * TDEE = BMR × activity multiplier
 */
function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  if (!multiplier) throw new Error(`Unknown activity level: ${activityLevel}`);
  return Math.round(bmr * multiplier);
}

/**
 * Calculate the daily calorie target for weight loss.
 * Target = TDEE - 500 (creates ~0.5kg/week deficit)
 * Safety floors: 1,200 cal/day for women, 1,500 cal/day for men.
 */
function calculateDailyTarget(tdee, gender) {
  const raw = tdee - DAILY_DEFICIT_CAL;
  const floor = gender === 'male' ? MIN_CALORIES_MALE : MIN_CALORIES_FEMALE;
  return Math.max(raw, floor);
}

/**
 * Calculate macro targets from daily calorie target.
 * Protein: 30% of calories ÷ 4 cal/g
 * Carbs:   45% of calories ÷ 4 cal/g
 * Fiber:   14g per 1,000 calories
 */
function calculateMacros(dailyCalories) {
  const protein = Math.round((dailyCalories * MACRO_RATIOS.protein_percent) / CALORIES_PER_GRAM.protein);
  const carbs = Math.round((dailyCalories * MACRO_RATIOS.carbs_percent) / CALORIES_PER_GRAM.carbs);
  const fiber = Math.round((dailyCalories / 1000) * MACRO_RATIOS.fiber_per_1000_cal);
  return { protein, carbs, fiber };
}

/**
 * Calculate estimated weeks to reach goal weight.
 * At 0.5kg/week loss: weeks = (current - goal) / 0.5
 * If goal >= current (maintenance or gain), return 0.
 */
function calculateWeeksToGoal(currentWeightKg, goalWeightKg) {
  if (goalWeightKg >= currentWeightKg) return 0;
  return Math.round((currentWeightKg - goalWeightKg) / WEEKLY_LOSS_KG);
}

/**
 * Main entry point — calculates ALL targets for a user.
 * Called from POST /api/profile/setup.
 *
 * @param {object} params - User's onboarding data
 * @returns {object} Complete set of calculated targets
 */
export function calculateTargets({ gender, age, heightCm, weightKg, goalWeightKg, activityLevel }) {
  const bmr = calculateBMR({ gender, age, heightCm, weightKg });
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalorieTarget = calculateDailyTarget(tdee, gender);
  const macros = calculateMacros(dailyCalorieTarget);
  const estimatedWeeksToGoal = calculateWeeksToGoal(weightKg, goalWeightKg);

  return {
    daily_calorie_target: dailyCalorieTarget,
    daily_protein_target_g: macros.protein,
    daily_carbs_target_g: macros.carbs,
    daily_fiber_target_g: macros.fiber,
    estimated_weeks_to_goal: estimatedWeeksToGoal,
  };
}
