// components/MealCard.js
// What: Single meal in a vertical timeline — colored dot, connector line, hover-reveal delete.
// Why 'use client': Delete requires onClick + useState for confirm flow.
// isLast prop controls whether the vertical connector line is shown below this item.

'use client';

import { useState } from 'react';

// Per-type color config: dot background, text color, emoji icon
const MEAL_COLORS = {
  breakfast: { bg: '#FEF3C7', color: '#D97706', emoji: '☀️' },
  lunch:     { bg: '#DBEAFE', color: '#2563EB', emoji: '🌤️' },
  dinner:    { bg: '#E0E7FF', color: '#4F46E5', emoji: '🌙' },
  snack:     { bg: '#FCE7F3', color: '#DB2777', emoji: '🍎' },
};

export default function MealCard({ meal, onDelete, isLast }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const time = new Date(meal.logged_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const colors = MEAL_COLORS[meal.meal_type] || { bg: '#F3F4F6', color: '#6B7280', emoji: '🍽️' };

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(meal.id);
    } catch (error) {
      console.error('Failed to delete meal:', error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="flex items-start gap-4 group">

      {/* ─── Timeline indicator: dot + vertical connector ─── */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="p-2.5 rounded-full" style={{ backgroundColor: colors.bg }}>
          <span className="text-base leading-none">{colors.emoji}</span>
        </div>
        {/* Vertical line — hidden on the last item */}
        {!isLast && (
          <div className="w-0.5 h-10 bg-gray-200 mt-1" />
        )}
      </div>

      {/* ─── Meal content ─── */}
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{meal.food_name}</p>
            <div className="flex items-center gap-2 text-sm mt-0.5 flex-wrap">
              <span className="text-gray-400">{time}</span>
              {meal.meal_type && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="capitalize font-medium" style={{ color: colors.color }}>
                    {meal.meal_type}
                  </span>
                </>
              )}
              <span className="text-gray-300">•</span>
              <span className="font-semibold" style={{ color: colors.color }}>
                {meal.calories} cal
              </span>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              <span>P: {Math.round(meal.protein_g)}g</span>
              <span>C: {Math.round(meal.carbs_g)}g</span>
              <span>F: {Math.round(meal.fiber_g)}g</span>
            </div>
          </div>

          {/* Delete — hidden until hover */}
          <div className="flex-shrink-0">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-red-400"
                aria-label="Remove meal"
              >
                ✕
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Remove'}
                </button>
                <span className="text-gray-200">|</span>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
