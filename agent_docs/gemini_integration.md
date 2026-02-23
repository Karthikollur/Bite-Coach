# Gemini Integration — Bite Coach

> The photo → calorie analysis flow. This is the most important feature in the app.

---

## Overview

1. User takes/uploads food photo
2. Frontend compresses image (1024px, 80% JPEG → ~200KB)
3. Frontend sends to POST /api/meals/analyze
4. Server converts to base64, sends to Gemini Flash with prompt
5. Gemini returns JSON with food analysis
6. Server validates response
7. Frontend shows results with edit controls

---

## Gemini Setup (lib/gemini.js)

```javascript
// lib/gemini.js
// What: Helper to call the Gemini API for food photo analysis.
// Why: Keeps API logic in one place so API routes stay clean.

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with our API key (server-side only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the Flash model — fastest and free tier
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Analyze a food photo and return calorie/macro estimates.
 * @param {string} base64Image - The food photo as a base64 string
 * @param {string} mimeType - Image MIME type (e.g., "image/jpeg")
 * @returns {object} Parsed nutrition data
 */
export async function analyzeFoodPhoto(base64Image, mimeType = "image/jpeg") {
  const prompt = FOOD_ANALYSIS_PROMPT;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  // Parse and validate the JSON response
  return parseGeminiResponse(text);
}
```

---

## The Prompt (Key to Accuracy)

This is the most important piece of code in the entire app. The prompt determines how good the calorie estimates are.

```javascript
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
  "confidence": "high" | "medium" | "low",
  "notes": "any relevant notes about the estimation"
}`;
```

### Prompt Design Decisions
- **Rule 4 (mixed dishes):** Most calorie tracking fails on mixed dishes. We explicitly ask Gemini to account for hidden fats.
- **Rule 5 (ethnic foods):** Our target user (Priya) eats Indian food. We tell Gemini to use cuisine-specific knowledge.
- **Rule 7 (no zero calories):** Prevents the AI from returning "0 calories" when it can't identify food.
- **"Return ONLY valid JSON":** Prevents Gemini from wrapping response in markdown code blocks.

---

## Response Validation (lib/gemini.js continued)

```javascript
/**
 * Parse and validate Gemini's response.
 * Why: Gemini sometimes returns unexpected formats. We MUST validate before showing to users.
 */
function parseGeminiResponse(text) {
  // Step 1: Clean the response (remove markdown code blocks if Gemini adds them)
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

  // Step 2: Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('INVALID_JSON');
  }

  // Step 3: Validate required fields
  if (!parsed.foods || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
    throw new Error('NO_FOODS_DETECTED');
  }
  if (!parsed.total || typeof parsed.total.calories !== 'number') {
    throw new Error('MISSING_TOTALS');
  }

  // Step 4: Sanity check numbers
  if (parsed.total.calories < 10) {
    throw new Error('CALORIES_TOO_LOW');
  }
  if (parsed.total.calories > 5000) {
    // Single meal over 5000 cal is almost certainly wrong
    parsed.confidence = 'low';
    parsed.notes = (parsed.notes || '') + ' Warning: unusually high calorie estimate.';
  }

  // Step 5: Ensure all numeric fields exist
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
```

---

## Retry Logic

```javascript
/**
 * Analyze with retry — if first attempt fails, try once more with stricter prompt.
 */
export async function analyzeFoodPhotoWithRetry(base64Image, mimeType) {
  try {
    // First attempt with standard prompt
    return await analyzeFoodPhoto(base64Image, mimeType);
  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      // Retry with stricter prompt
      console.warn('Gemini returned invalid JSON, retrying with stricter prompt...');
      return await analyzeFoodPhotoStrict(base64Image, mimeType);
    }
    // Re-throw other errors
    throw error;
  }
}
```

---

## Error Handling in API Route

```javascript
// In POST /api/meals/analyze
try {
  const result = await analyzeFoodPhotoWithRetry(base64Image, mimeType);
  return NextResponse.json(result);
} catch (error) {
  console.error('Meal analysis error:', error.message);

  const errorMessages = {
    'INVALID_JSON': 'We couldn\'t analyze this photo. Try a clearer shot.',
    'NO_FOODS_DETECTED': 'We couldn\'t find food in this photo. Try taking a photo of your meal.',
    'CALORIES_TOO_LOW': 'We couldn\'t get a reliable estimate. Try a different angle.',
    'MISSING_TOTALS': 'Analysis incomplete. Please try again.',
  };

  const message = errorMessages[error.message] || 'Analysis failed. Please try again.';
  const status = error.message === 'NO_FOODS_DETECTED' ? 400 : 500;

  return NextResponse.json({ error: message }, { status });
}
```

---

## Client-Side Image Compression

Before sending to the server, compress the image to reduce upload time and API costs.

```javascript
// components/PhotoUpload.js (partial)

/**
 * Compress an image file before uploading.
 * Why: Phone photos can be 5-15MB. We compress to ~200KB (40x smaller).
 * How: Resize to max 1024px wide, 80% JPEG quality using Canvas API.
 */
async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 1024;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

---

## Rate Limits

| Tier | Limit | What It Means |
|------|-------|--------------|
| Free (Gemini Flash) | 1,000 requests/day | ~333 users × 3 meals/day |
| With Google Pro | Possibly higher | Check Google AI Studio dashboard |
| Paid tier | Pay per token | ~$0.001-0.003 per analysis |

If rate limited, the API returns a 429 status. Show: "Our AI is busy right now. Try again in a few minutes."