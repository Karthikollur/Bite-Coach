// components/CalorieRing.js
// What: Hero circular progress ring — 220px, color-coded, CSS-animated.
// Why: The ring is the first thing the user sees. Bigger = more motivating.
// Pure display component — no data fetching, renders from props only.

export default function CalorieRing({ consumed, target }) {
  const percent = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const isOver = consumed > target;

  // SVG ring math
  const size = 220;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  // Color: green → amber (75%+) → red (90%+ or over)
  const ringColor =
    isOver || percent >= 90
      ? '#EF4444'  // red
      : percent >= 75
      ? '#F59E0B'  // amber
      : '#10B981'; // green

  const remaining = target - consumed;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          {/* Gray track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Colored progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center text — rendered upright inside the rotated SVG container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: ringColor }}
          >
            {consumed.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            of {target.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      {/* Label below ring */}
      <div className="text-center">
        <p className="font-semibold text-gray-900">Calories Today</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {isOver
            ? `${Math.abs(remaining).toLocaleString()} cal over target`
            : `${remaining.toLocaleString()} cal remaining`}
        </p>
      </div>

      {/* Safety disclaimer — required by health rules */}
      <p className="text-xs text-gray-400">Estimates are approximate</p>
    </div>
  );
}
