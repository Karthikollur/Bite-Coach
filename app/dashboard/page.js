// app/dashboard/page.js
// What: Main dashboard — motivational banner → hero ring + macro cards → summary + meal timeline.
// Why 'use client': useEffect for data loading + useState for state + delete handler.

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import MealCard from '@/components/MealCard';
import CoachingNudge from '@/components/CoachingNudge';
import DailySummaryCard from '@/components/DailySummaryCard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

  // Fetch all dashboard data from the single API route
  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/dashboard?date=${today}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load dashboard');
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Delete a meal and refresh the dashboard
  async function handleDeleteMeal(mealId) {
    const response = await fetch(`/api/meals/${mealId}`, { method: 'DELETE' });

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.error || 'Failed to delete meal');
    }

    await loadDashboard();
  }

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-5">
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-72 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="text-green-600 font-medium hover:text-green-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { profile, today: todayData, meals, feedback } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Pass user name so Navbar can show the initial avatar */}
      <Navbar userName={profile.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ─── Motivational Banner — coaching nudge at the top ─── */}
        {feedback && (
          <CoachingNudge nudge={feedback.nudge} type={feedback.type} />
        )}

        {/* ─── Hero Section: Calorie Ring + Macro Cards ─── */}
        {/* Gradient card makes this section feel premium and focused */}
        <div className="bg-gradient-to-br from-white to-green-50/50 rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8">

            {/* Calorie ring — hero visual, leftmost on desktop */}
            <div className="flex-shrink-0">
              <CalorieRing
                consumed={todayData.total_calories}
                target={profile.daily_calorie_target}
              />
            </div>

            {/* Macro cards — 3-column grid right of ring on desktop */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MacroBar
                  label="Protein"
                  current={todayData.total_protein_g}
                  target={profile.daily_protein_target_g}
                  unit="g"
                />
                <MacroBar
                  label="Carbs"
                  current={todayData.total_carbs_g}
                  target={profile.daily_carbs_target_g}
                  unit="g"
                />
                <MacroBar
                  label="Fiber"
                  current={todayData.total_fiber_g}
                  target={profile.daily_fiber_target_g}
                  unit="g"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Lower Section: Summary (1 col) + Meal Timeline (2 cols) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Daily Summary card — left column */}
          <div>
            <DailySummaryCard
              caloriesRemaining={todayData.remaining_calories}
              weeksToGoal={profile.estimated_weeks_to_goal}
            />
          </div>

          {/* Meal Timeline — takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

              {/* Timeline header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Today&apos;s Meals</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {meals.length} {meals.length === 1 ? 'meal' : 'meals'} logged
                  </p>
                </div>
                {meals.length > 0 && (
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    {todayData.total_calories} cal total
                  </span>
                )}
              </div>

              {/* Empty state */}
              {meals.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🍽️</span>
                  </div>
                  <p className="text-gray-600 font-medium">No meals logged yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start tracking your first meal today!
                  </p>
                </div>
              ) : (
                <div>
                  {/* Timeline items — isLast hides the connector line on the final item */}
                  {meals.map((meal, index) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onDelete={handleDeleteMeal}
                      isLast={index === meals.length - 1}
                    />
                  ))}

                  {/* Total footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total logged</span>
                    <span className="text-lg font-bold text-green-600 tabular-nums">
                      {todayData.total_calories} cal
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── Floating "Log a Meal" CTA ─── */}
      {/* Fixed to bottom — always reachable on any screen size */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-20">
        <div className="max-w-sm mx-auto">
          <Link
            href="/log-meal"
            className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-600 transition-colors active:scale-95"
          >
            📸 Log a Meal
          </Link>
        </div>
      </div>
    </div>
  );
}
