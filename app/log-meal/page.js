// app/log-meal/page.js
// What: The photo upload + AI analysis + meal save flow.
// This is the core feature of the app — snap a photo, get estimates, save to log.
// Why 'use client': Multiple useState hooks + event handlers + fetch calls.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PhotoUpload from '@/components/PhotoUpload';

// Meal type options for the user to categorize their meal
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function LogMealPage() {
  const router = useRouter();

  // State for the photo upload flow
  const [photoFile, setPhotoFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  // State for the analysis results
  const [result, setResult] = useState(null);

  // State for the editable fields (user can adjust AI estimates before saving)
  const [editedName, setEditedName] = useState('');
  const [editedCalories, setEditedCalories] = useState('');
  const [editedProtein, setEditedProtein] = useState('');
  const [editedCarbs, setEditedCarbs] = useState('');
  const [editedFiber, setEditedFiber] = useState('');
  const [mealType, setMealType] = useState('');

  // State for the save flow
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Called when the user selects/captures a photo
  function handlePhotoReady(file) {
    setPhotoFile(file);
    setResult(null); // Clear any previous results
    setAnalyzeError(null);
  }

  // Send photo to Gemini for analysis
  async function handleAnalyze() {
    if (!photoFile) return;

    setAnalyzing(true);
    setAnalyzeError(null);

    try {
      const formData = new FormData();
      formData.append('image', photoFile);

      const response = await fetch('/api/meals/analyze', {
        method: 'POST',
        body: formData, // No Content-Type header — browser sets it automatically for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed. Please try again.');
      }

      // Pre-fill the edit fields with AI estimates
      // User can change them before saving
      setResult(data);
      const combinedName = data.foods.map(f => f.name).join(' + ');
      setEditedName(combinedName);
      setEditedCalories(String(Math.round(data.total.calories)));
      setEditedProtein(String(Math.round(data.total.protein_g)));
      setEditedCarbs(String(Math.round(data.total.carbs_g)));
      setEditedFiber(String(Math.round(data.total.fiber_g)));
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  // Save the meal (with user's edits) to the database
  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/meals/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: editedName,
          calories: parseInt(editedCalories) || 0,
          protein_g: parseFloat(editedProtein) || 0,
          carbs_g: parseFloat(editedCarbs) || 0,
          fiber_g: parseFloat(editedFiber) || 0,
          meal_type: mealType || null,
          ai_original_calories: result ? result.total.calories : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Couldn't save meal. Please try again.");
      }

      // Success! Go to dashboard to see updated totals
      router.push('/dashboard');
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log a meal</h1>
          <p className="text-gray-500 text-sm mt-1">
            Take a photo — our AI estimates the calories and macros
          </p>
        </div>

        {/* Step 1: Photo upload */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Step 1: Upload photo
          </h2>
          <PhotoUpload onPhotoReady={handlePhotoReady} />
        </div>

        {/* Analyze button — only shown when a photo has been selected */}
        {photoFile && !result && (
          <div>
            {analyzeError && (
              <div className="mb-3 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {analyzeError}
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing your meal...
                </span>
              ) : (
                '✨ Analyze My Meal'
              )}
            </button>
            {analyzing && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Usually takes 3-5 seconds
              </p>
            )}
          </div>
        )}

        {/* Step 2: Analysis results + edit controls */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Step 2: Review &amp; edit
              </h2>
              {/* Confidence badge */}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                result.confidence === 'high'
                  ? 'bg-green-100 text-green-700'
                  : result.confidence === 'low'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {result.confidence} confidence
              </span>
            </div>

            {/* Individual foods detected */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Foods detected:</p>
              {result.foods.map((food, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-700">{food.name} <span className="text-gray-400">({food.portion})</span></span>
                  <span className="text-gray-900 font-medium">{food.calories} cal</span>
                </div>
              ))}
            </div>

            {/* AI notes (if any) */}
            {result.notes && (
              <p className="text-xs text-gray-400 italic">Note: {result.notes}</p>
            )}

            {/* Editable meal name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Meal name <span className="text-gray-400">(edit if needed)</span>
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Meal type selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Meal type <span className="text-gray-400">(optional)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(mealType === type ? '' : type)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                      mealType === type
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable nutrition values */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Nutrition totals <span className="text-gray-400">(adjust if AI got it wrong)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Calories</label>
                  <input
                    type="number"
                    value={editedCalories}
                    onChange={(e) => setEditedCalories(e.target.value)}
                    min="0"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Protein (g)</label>
                  <input
                    type="number"
                    value={editedProtein}
                    onChange={(e) => setEditedProtein(e.target.value)}
                    min="0"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Carbs (g)</label>
                  <input
                    type="number"
                    value={editedCarbs}
                    onChange={(e) => setEditedCarbs(e.target.value)}
                    min="0"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Fiber (g)</label>
                  <input
                    type="number"
                    value={editedFiber}
                    onChange={(e) => setEditedFiber(e.target.value)}
                    min="0"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {saveError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {saveError}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || !editedName || !editedCalories}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '✅ Save to My Log'}
            </button>

            {/* Re-analyze option */}
            <button
              onClick={() => {
                setResult(null);
                setAnalyzeError(null);
              }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              ↩ Re-analyze with a different photo
            </button>
          </div>
        )}

        {/* Manual entry option */}
        {!result && !photoFile && (
          <div className="text-center">
            <p className="text-sm text-gray-400">
              No camera?{' '}
              <button
                onClick={() => {
                  // Create a fake result so the edit form shows up for manual entry
                  setResult({ foods: [], total: { calories: 0, protein_g: 0, carbs_g: 0, fiber_g: 0 }, confidence: 'low', notes: '' });
                  setEditedName('');
                  setEditedCalories('0');
                  setEditedProtein('0');
                  setEditedCarbs('0');
                  setEditedFiber('0');
                }}
                className="text-green-600 font-medium hover:text-green-700"
              >
                Enter meal manually
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
