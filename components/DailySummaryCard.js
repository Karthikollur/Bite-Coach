// components/DailySummaryCard.js
// What: At-a-glance summary card — calories remaining, goal timeline, dynamic message.
// Why: Gives the user a quick read on where they stand without scanning the full dashboard.
// Pure display component — all values come from dashboard props.

export default function DailySummaryCard({ caloriesRemaining, weeksToGoal }) {
  // Dynamic message based on how many calories are left today
  function getMessage() {
    if (caloriesRemaining > 500) return 'Great start! Keep logging your meals.';
    if (caloriesRemaining > 100) return "Almost there! You're doing amazing.";
    if (caloriesRemaining > 0)   return 'Perfect balance! Stay consistent.';
    return "You've reached your goal for today!";
  }

  const isOnTrack = caloriesRemaining >= 0 && caloriesRemaining <= 500;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900 mb-0.5">Daily Summary</h2>
          <p className="text-sm text-emerald-700">{getMessage()}</p>
        </div>
        {/* Target icon — wiggles when off track */}
        <span className={`text-xl ${isOnTrack ? '' : 'animate-bounce'}`}>🎯</span>
      </div>

      {/* Calories remaining — big number */}
      <div className="bg-white rounded-lg p-4 border border-green-100 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Calories Remaining
        </p>
        <p className={`text-4xl font-bold tabular-nums ${
          caloriesRemaining < 0 ? 'text-red-500' : 'text-green-600'
        }`}>
          {Math.abs(Math.round(caloriesRemaining))}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          {caloriesRemaining < 0 ? 'over target today' : 'cal left today'}
        </p>
      </div>

      {/* Goal timeline — shown only if a goal is set */}
      {weeksToGoal > 0 && (
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Goal Timeline
          </p>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">
            ~{weeksToGoal}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">weeks to goal weight</p>
          <p className="text-xs text-gray-400 mt-2">
            Based on a healthy 0.5 kg/week pace
          </p>
        </div>
      )}

      {/* On-track badge */}
      {isOnTrack && caloriesRemaining < 200 && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <p className="text-sm font-semibold text-green-800">You&apos;re on track!</p>
            <p className="text-xs text-green-700">Keep up the great work today.</p>
          </div>
        </div>
      )}
    </div>
  );
}
