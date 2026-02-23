// lib/gemini.js
// What: Helper to call the Gemini API for food photo analysis.
// Why: Keeps all Gemini API logic in one file so API routes stay clean.
//      This file runs SERVER-SIDE ONLY — the GEMINI_API_KEY is never sent to the browser.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL } from '@/lib/constants';

// Initialize Gemini with our API key (server-side only — no NEXT_PUBLIC_ prefix)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the Flash model — fastest response time and free tier (1,000 req/day)
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// The main prompt for food analysis.
// This is the most important piece of code in the app — it determines accuracy.
const FOOD_ANALYSIS_PROMPT = `You are a nutrition analysis expert. Analyze this food photo and return a JSON response with calorie and macronutrient estimates.

Rules:
1. Identify ALL food items visible in the photo
2. Estimate portion sizes using visual cues (plate size, utensils, hand size, standard serving containers)
3. Return realistic estimates — don't round to neat numbers
4. For mixed dishes (curries, stir-fries, stews), estimate combined totals including cooking oils, sauces, and hidden fats
5. For Indian/Asian/ethnic foods, use cuisine-specific knowledge (ghee in dal, oil in sabzi, coconut milk in curry, etc.)
6. If uncertain about a food, provide your best estimate and set confidence to "low"
7. NEVER return zero calories for visible food

Return ONLY valid JSON in this exact format (no markdown, no explanation, just JSON):
{
  "foods": [
    {
      "name": "food item name",
      "portion": "estimated portion (e.g., '1 cup', '200g')",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fiber_g": number
    }
  ],
  "total": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fiber_g": number
  },
  "confidence": "high",
  "notes": "any relevant notes about the estimation"
}`;

// Stricter version of the prompt — used on retry after invalid JSON
const STRICT_PROMPT = `${FOOD_ANALYSIS_PROMPT}

CRITICAL: Your previous response was not valid JSON. You MUST return ONLY a raw JSON object.
Do NOT include markdown code blocks, backticks, or any text before or after the JSON.
Start your response with { and end with }`;

/**
 * Parse and validate Gemini's raw text response.
 * Why: Gemini sometimes wraps JSON in markdown code blocks, or returns unexpected formats.
 * We must validate before showing numbers to users.
 */
function parseGeminiResponse(text) {
  // Clean the response — remove markdown code blocks if Gemini added them
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('INVALID_JSON');
  }

  // Validate required structure
  if (!parsed.foods || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
    throw new Error('NO_FOODS_DETECTED');
  }
  if (!parsed.total || typeof parsed.total.calories !== 'number') {
    throw new Error('MISSING_TOTALS');
  }

  // Sanity check: real food shouldn't be under 10 calories
  if (parsed.total.calories < 10) {
    throw new Error('CALORIES_TOO_LOW');
  }

  // Flag suspicious estimates but don't block
  if (parsed.total.calories > 5000) {
    parsed.confidence = 'low';
    parsed.notes = (parsed.notes || '') + ' Warning: unusually high calorie estimate.';
  }

  // Ensure all food items have required fields with fallbacks
  parsed.foods = parsed.foods.map(food => ({
    name: food.name || 'Unknown food',
    portion: food.portion || 'estimated',
    calories: food.calories || 0,
    protein_g: food.protein_g || 0,
    carbs_g: food.carbs_g || 0,
    fiber_g: food.fiber_g || 0,
  }));

  parsed.confidence = parsed.confidence || 'medium';
  parsed.notes = parsed.notes || '';

  return parsed;
}

/**
 * Analyze a food photo using the standard prompt.
 * @param {string} base64Image - Photo as base64 string
 * @param {string} mimeType - e.g., "image/jpeg"
 */
async function analyzeFoodPhoto(base64Image, mimeType = 'image/jpeg') {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([FOOD_ANALYSIS_PROMPT, imagePart]);
  const text = result.response.text();
  return parseGeminiResponse(text);
}

/**
 * Analyze with retry — if JSON parsing fails, retry once with stricter prompt.
 * Why: Gemini occasionally returns markdown-wrapped JSON despite instructions.
 * One retry fixes ~95% of these cases.
 */
export async function analyzeFoodPhotoWithRetry(base64Image, mimeType = 'image/jpeg') {
  try {
    return await analyzeFoodPhoto(base64Image, mimeType);
  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      console.warn('Gemini returned invalid JSON, retrying with stricter prompt...');
      // Retry with stricter prompt
      const imagePart = {
        inlineData: { data: base64Image, mimeType },
      };
      const result = await model.generateContent([STRICT_PROMPT, imagePart]);
      return parseGeminiResponse(result.response.text());
    }
    throw error;
  }
}
