// app/onboarding/page.js
// What: Collects the user's personal stats to calculate their calorie targets.
// Why 'use client': Multi-step form with useState for each field + submit handler.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVITY_LABELS } from '@/lib/constants';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // Stores calculated targets after submit

  // Form fields — all required for the calorie formula
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    height_cm: '',
    current_weight_kg: '',
    goal_weight_kg: '',
    activity_level: '',
  });

  // Generic handler — updates any field by name
  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          age: parseInt(formData.age),
          height_cm: parseFloat(formData.height_cm),
          current_weight_kg: parseFloat(formData.current_weight_kg),
          goal_weight_kg: parseFloat(formData.goal_weight_kg),
          activity_level: formData.activity_level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Show the user their calculated targets before redirecting
      setResult(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // After showing results, go to dashboard
  function handleContinue() {
    router.push('/dashboard');
  }

  // ─── Results screen (shown after successful submission) ───
  if (result) {
    const weeksText = result.estimated_weeks_to_goal > 0
      ? `~${result.estimated_weeks_to_goal} weeks to your goal weight`
      : 'At or near your goal weight — focusing on maintenance';

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-2xl font-bold text-gray-900">Your targets are set!</h1>
            <p className="text-gray-500 text-sm mt-1">
              Personalized to your body and goal
            </p>
          </div>

          {/* Targets card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Daily calories</span>
              <span className="font-bold text-xl text-green-600">
                {result.daily_calorie_target} cal
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Protein</span>
              <span className="font-semibold text-gray-900">{result.daily_protein_target_g}g</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Carbs</span>
              <span className="font-semibold text-gray-900">{result.daily_carbs_target_g}g</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Fiber</span>
              <span className="font-semibold text-gray-900">{result.daily_fiber_target_g}g</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4 bg-green-50 rounded-xl p-4 text-center">
            <p className="text-green-700 font-medium text-sm">📅 {weeksText}</p>
            <p className="text-green-600 text-xs mt-1">
              Based on a healthy 0.5 kg/week pace
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full mt-6 bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors"
          >
            Log my first meal →
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            All calorie estimates are approximate. Always consult a professional for medical advice.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main form ───
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🥗</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Let&apos;s set your targets</h1>
          <p className="text-gray-500 text-sm mt-1">
            Takes 2 minutes · We use this to calculate your personal calorie goal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">

          {/* Name (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Priya"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['male', 'female'].map((g) => (
                <label
                  key={g}
                  className={`flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.gender === g
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="sr-only" // Visually hidden — the label IS the button
                    required
                  />
                  <span className="capitalize font-medium">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="15"
              max="100"
              placeholder="e.g., 29"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="height_cm"
              value={formData.height_cm}
              onChange={handleChange}
              required
              min="100"
              max="250"
              placeholder="e.g., 165"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Current weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current weight (kg) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="current_weight_kg"
              value={formData.current_weight_kg}
              onChange={handleChange}
              required
              min="30"
              max="300"
              step="0.1"
              placeholder="e.g., 76"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Goal weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal weight (kg) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="goal_weight_kg"
              value={formData.goal_weight_kg}
              onChange={handleChange}
              required
              min="30"
              max="300"
              step="0.1"
              placeholder="e.g., 68"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Activity level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity level <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.activity_level === value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="activity_level"
                    value={value}
                    checked={formData.activity_level === value}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-green-500 accent-green-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating your targets...' : 'Calculate my targets →'}
          </button>
        </form>
      </div>
    </div>
  );
}
