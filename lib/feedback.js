// lib/feedback.js
// What: Generates personalized coaching nudges based on today's intake vs targets.
// Why: This is Bite Coach's key differentiator — active coaching after every meal,
//      not just passive number tracking. Rules are checked in priority order.

import { MIN_CALORIES_FEMALE, MIN_CALORIES_MALE } from '@/lib/constants';

/**
 * Health safety check — runs BEFORE all other rules.
 * If the user's target is dangerously low, warn them.
 * This protects users from harm and is non-negotiable.
 */
function checkHealthSafety({ targetCalories, gender }) {
  const minCalories = gender === 'female' ? MIN_CALORIES_FEMALE : MIN_CALORIES_MALE;

  if (targetCalories < minCalories) {
    return {
      type: 'safety_floor',
      priority: 0,
      nudge: `Your calorie target seems very low. For your health, we recommend at least ${minCalories} calories per day. Please consult a healthcare professional.`,
    };
  }

  return null;
}

/**
 * Generate a personalized coaching nudge based on today's intake.
 * Checks 7 rules in priority order — returns the FIRST match.
 *
 * Language rules (non-negotiable):
 * ✅ Encouraging, specific, actionable
 * ❌ NO: "bad", "cheat", "guilty", "fat", "failure", "terrible", "awful"
 */
export function generateFeedback({
  totalCalories,
  targetCalories,
  totalProtein,
  targetProtein,
  totalCarbs,
  targetCarbs,
  totalFiber,
  targetFiber,
  mealsCount,
  currentHour,
  gender,
}) {
  // Safety check takes priority over everything else
  const safetyNudge = checkHealthSafety({ targetCalories, gender });
  if (safetyNudge) return safetyNudge;

  // Rule 1: Over calorie target by more than 200 calories
  // Gentle suggestion — never shame, always provide a positive action
  if (totalCalories > targetCalories + 200) {
    return {
      type: 'calories_over',
      priority: 1,
      nudge: `You're over your calorie target today. Consider a lighter next meal or a short walk after dinner — every bit helps!`,
    };
  }

  // Rule 2: Protein below 50% of target after 2+ meals
  // Protein is critical for muscle preservation during weight loss
  if (totalProtein < targetProtein * 0.5 && mealsCount >= 2) {
    return {
      type: 'protein_low',
      priority: 2,
      nudge: `Protein is running low today (${Math.round(totalProtein)}g of ${targetProtein}g). Try adding eggs, paneer, chicken, yogurt, or lentils to your next meal!`,
    };
  }

  // Rule 3: Carbs over target by more than 30g
  // Offer practical swaps, not restrictions
  if (totalCarbs > targetCarbs + 30) {
    return {
      type: 'carbs_high',
      priority: 3,
      nudge: `Carbs are a little high today. For your next meal, consider swapping rice for salad or dal, or choosing a protein-heavy option.`,
    };
  }

  // Rule 4: Under-eating after 7pm — metabolic concern
  // Being under 500 cal below target at 7pm+ is a health risk
  if (totalCalories < targetCalories - 500 && currentHour >= 19) {
    return {
      type: 'under_eating',
      priority: 4,
      nudge: `You've only had ${totalCalories} calories today — that's quite low! Make sure to eat a proper dinner. Under-eating can slow your metabolism over time.`,
    };
  }

  // Rule 5: Perfect balance — all macros within 10% of target
  // Celebrate! Positive reinforcement drives retention.
  const calOk = Math.abs(totalCalories - targetCalories) <= targetCalories * 0.1;
  const proOk = Math.abs(totalProtein - targetProtein) <= targetProtein * 0.1;
  const carbOk = Math.abs(totalCarbs - targetCarbs) <= targetCarbs * 0.1;
  if (calOk && proOk && carbOk && mealsCount >= 2) {
    return {
      type: 'perfect_balance',
      priority: 5,
      nudge: `Amazing balance today! Your protein, carbs, and calories are all right on track. Keep this up — you're doing brilliantly! 🌟`,
    };
  }

  // Rule 6: Low logging — only 1 meal after 2pm
  // Encouraging reminder, not nagging
  if (mealsCount <= 1 && currentHour >= 14) {
    return {
      type: 'low_logging',
      priority: 6,
      nudge: `Only one meal logged so far — don't forget to log your lunch and snacks! Consistent logging leads to better results.`,
    };
  }

  // Rule 7: Default — warm encouragement with remaining targets
  // Every interaction should feel positive and supportive
  const remaining = targetCalories - totalCalories;
  return {
    type: 'default',
    priority: 7,
    nudge: remaining > 0
      ? `You're doing well! ${totalCalories} calories logged out of ${targetCalories}. You have ${remaining} calories remaining today. Keep going — you've got this!`
      : `You've reached your calorie target for today. Nice work staying on track!`,
  };
}

/**
 * Multi-day safety check — warns if intake has been very low for 3+ days.
 * Called from the dashboard on load, using recent daily_logs data.
 */
export function checkMultiDaySafety(recentDailyLogs) {
  if (!recentDailyLogs || recentDailyLogs.length < 3) return null;

  const lastThreeDays = recentDailyLogs.slice(0, 3);
  const consecutiveLowDays = lastThreeDays.filter(
    (day) => day.total_calories < 1000
  ).length;

  if (consecutiveLowDays >= 3) {
    return {
      type: 'critical_safety',
      priority: 0,
      nudge: `Your calorie intake has been very low for the past few days. For your health and safety, please consult a healthcare professional to ensure your nutrition plan is right for you.`,
    };
  }

  return null;
}
