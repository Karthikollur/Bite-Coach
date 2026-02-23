// lib/constants.js
// What: Single source of truth for all magic numbers and config values.
// Why: Centralizing these means changing one value here updates the whole app.

// Activity level multipliers for TDEE calculation (Mifflin-St Jeor)
// These come from established sports science research
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // Desk job, little/no exercise
  light: 1.375,         // Light exercise 1-3 days/week
  moderate: 1.55,       // Moderate exercise 3-5 days/week
  active: 1.725,        // Hard exercise 6-7 days/week
  very_active: 1.9,     // Physical job + hard exercise
};

// Safety calorie floors — NEVER recommend below these levels
// Based on established dietary guidelines (IOM, WHO)
export const MIN_CALORIES_FEMALE = 1200;
export const MIN_CALORIES_MALE = 1500;

// Macro ratios — how to split daily calories into macros
// These are evidence-based targets for weight loss while preserving muscle
export const MACRO_RATIOS = {
  protein_percent: 0.30,  // 30% of calories from protein
  carbs_percent: 0.45,    // 45% of calories from carbs
  fiber_per_1000_cal: 14, // 14g of fiber per 1,000 calories (FDA recommendation)
};

// Calories per gram of each macronutrient (food science fundamentals)
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
  fiber: 2,
};

// Weekly weight loss pace: 0.5 kg/week = 500 cal/day deficit
export const WEEKLY_LOSS_KG = 0.5;
export const DAILY_DEFICIT_CAL = 500;

// Gemini model to use for food analysis
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Activity level display labels for UI
export const ACTIVITY_LABELS = {
  sedentary: 'Sedentary (desk job, little exercise)',
  light: 'Light (exercise 1-3 days/week)',
  moderate: 'Moderate (exercise 3-5 days/week)',
  active: 'Active (exercise 6-7 days/week)',
  very_active: 'Very Active (physical job + exercise)',
};
