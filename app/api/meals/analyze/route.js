// app/api/meals/analyze/route.js
// What: Receives a food photo, sends it to Gemini AI, returns calorie/macro estimates.
// When called: User uploads a photo on the /log-meal page.
// This is the most important API route in the app.

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { analyzeFoodPhotoWithRetry } from '@/lib/gemini';

export async function POST(request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse the uploaded image from FormData
    // FormData is how browsers send file uploads — different from JSON
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided. Please upload a food photo.' },
        { status: 400 }
      );
    }

    // 3. Convert the image file to base64
    // Why base64? Gemini's API accepts images as base64-encoded strings.
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    // 4. Send to Gemini with retry logic (handles occasional JSON parse failures)
    const result = await analyzeFoodPhotoWithRetry(base64Image, mimeType);

    // 5. Return the structured analysis to the frontend
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/meals/analyze error:', error.message);

    // Map internal error codes to friendly user messages
    const errorMessages = {
      'INVALID_JSON': "We couldn't analyze this photo. Try a clearer shot with better lighting.",
      'NO_FOODS_DETECTED': "We couldn't find food in this photo. Try taking a photo of your meal.",
      'CALORIES_TOO_LOW': "We couldn't get a reliable estimate. Try a different angle or closer shot.",
      'MISSING_TOTALS': "Analysis incomplete. Please try again.",
    };

    const message = errorMessages[error.message] || 'Analysis failed. Please try again.';
    const status = error.message === 'NO_FOODS_DETECTED' ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
