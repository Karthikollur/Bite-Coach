// app/profile/page.js
// What: Profile settings page — lets users update weight, goal, and activity level.
// Recalculates calorie targets when any of these change.
// Why 'use client': Form state + fetch for loading profile + update submission.

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { ACTIVITY_LABELS } from '@/lib/constants';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Editable fields (users can change these)
  const [name, setName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  // Load the user's current profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to load profile');

        setProfile(data.profile);
        // Pre-fill the form with current values
        setName(data.profile.name || '');
        setCurrentWeight(String(data.profile.current_weight_kg));
        setGoalWeight(String(data.profile.goal_weight_kg));
        setActivityLevel(data.profile.activity_level);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          current_weight_kg: parseFloat(currentWeight),
          goal_weight_kg: parseFloat(goalWeight),
          activity_level: activityLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to save changes');

      setProfile(data.profile);
      setSuccessMessage('Profile updated! Your calorie targets have been recalculated.');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Update your weight or goals — targets recalculate automatically
          </p>
        </div>

        {/* Current targets (read-only display) */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Your current targets
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {profile.daily_calorie_target}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">cal / day</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {profile.daily_protein_target_g}g
                </p>
                <p className="text-xs text-gray-500 mt-0.5">protein / day</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {profile.daily_carbs_target_g}g
                </p>
                <p className="text-xs text-gray-500 mt-0.5">carbs / day</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {profile.daily_fiber_target_g}g
                </p>
                <p className="text-xs text-gray-500 mt-0.5">fiber / day</p>
              </div>
            </div>

            {profile.estimated_weeks_to_goal > 0 && (
              <p className="mt-3 text-center text-sm text-gray-500">
                At this pace: <strong className="text-green-600">~{profile.estimated_weeks_to_goal} weeks</strong> to your goal weight
              </p>
            )}
          </div>
        )}

        {/* Edit form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Update your details
          </h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Priya"
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
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              required
              min="30"
              max="300"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Update this as you lose weight to keep targets accurate
            </p>
          </div>

          {/* Goal weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal weight (kg) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              required
              min="30"
              max="300"
              step="0.1"
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
                    activityLevel === value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="activity_level"
                    value={value}
                    checked={activityLevel === value}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-4 h-4 text-green-500 accent-green-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Read-only fields — can't change these without re-onboarding */}
          {profile && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-2">Fixed details (from onboarding)</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Gender</p>
                  <p className="text-sm font-medium text-gray-700 capitalize">{profile.gender}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-700">{profile.age}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Height</p>
                  <p className="text-sm font-medium text-gray-700">{profile.height_cm} cm</p>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
              ✅ {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        {/* Account info */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Account
            </h2>
            <p className="text-sm text-gray-600">
              Email: <strong>{profile.email}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-6">
          All calorie estimates are approximate. Always consult a healthcare professional for medical advice.
        </p>
      </main>
    </div>
  );
}
