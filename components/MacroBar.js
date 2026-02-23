// components/MacroBar.js
// What: Macro card with icon badge, colored progress bar, and smart microcopy.
// Why: Cards are more scannable than bare bars — each macro gets its own visual identity.
// Pure display component — renders from props only.

// Per-macro config: emoji icon, accent color, Tailwind bar class
const MACRO_CONFIG = {
  Protein: { emoji: '🥩', color: '#3B82F6', bgColor: '#EFF6FF', barClass: 'bg-blue-500' },
  Carbs:   { emoji: '🌾', color: '#F59E0B', bgColor: '#FEF3C7', barClass: 'bg-amber-500' },
  Fiber:   { emoji: '🥦', color: '#10B981', bgColor: '#D1FAE5', barClass: 'bg-emerald-500' },
};

export default function MacroBar({ label, current, target, unit }) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;
  const config = MACRO_CONFIG[label] || { emoji: '📊', color: '#6B7280', bgColor: '#F3F4F6', barClass: 'bg-gray-500' };
  const remaining = target - Math.round(current);

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">

      {/* Top row: icon badge (left) + current number (right) */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg text-xl leading-none" style={{ backgroundColor: config.bgColor }}>
          {config.emoji}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-gray-900">{Math.round(current)}</p>
          <p className="text-xs text-gray-500">of {target}{unit}</p>
        </div>
      </div>

      {/* Label + percentage row */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-gray-400">{Math.round(percent)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${isOver ? 'bg-red-500' : config.barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Microcopy — adapts to progress state */}
      <p className="mt-3 text-xs">
        {isOver ? (
          <span className="text-red-500 font-medium">Over by {Math.abs(remaining)}{unit}</span>
        ) : percent >= 100 ? (
          <span className="text-green-600 font-medium">✓ Goal reached!</span>
        ) : percent >= 75 ? (
          <span style={{ color: config.color }}>Almost there! {remaining}{unit} left</span>
        ) : (
          <span className="text-gray-400">{remaining}{unit} remaining</span>
        )}
      </p>
    </div>
  );
}
