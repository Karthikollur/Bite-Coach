// components/CoachingNudge.js
// What: Motivational banner with gradient background — surfaces the coaching message.
// Why: Supportive tone + strong visual identity makes the nudge feel personal, not clinical.
// Pure display component — nudge text and type come from the feedback engine via props.

export default function CoachingNudge({ nudge, type }) {
  if (!nudge) return null;

  // Each nudge type: emoji icon, gradient icon badge, bg + border, text color
  const styles = {
    perfect_balance: {
      emoji: '🌟', iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', orb: '#10B981',
    },
    calories_over: {
      emoji: '⚖️', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', orb: '#F59E0B',
    },
    protein_low: {
      emoji: '💪', iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', orb: '#3B82F6',
    },
    carbs_high: {
      emoji: '🥗', iconBg: 'bg-gradient-to-br from-orange-400 to-red-500',
      bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', orb: '#F97316',
    },
    under_eating: {
      emoji: '🍽️', iconBg: 'bg-gradient-to-br from-purple-400 to-violet-500',
      bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', orb: '#8B5CF6',
    },
    low_logging: {
      emoji: '📝', iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
      bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900', orb: '#0EA5E9',
    },
    safety_floor: {
      emoji: '⚠️', iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
      bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', orb: '#EF4444',
    },
    critical_safety: {
      emoji: '⚠️', iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
      bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', orb: '#EF4444',
    },
    default: {
      emoji: '✨', iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', orb: '#10B981',
    },
  };

  const style = styles[type] || styles.default;

  return (
    <div className={`rounded-xl p-6 border ${style.bg} ${style.border} shadow-sm overflow-hidden relative`}>
      {/* Decorative orb — depth effect behind the content */}
      <div
        className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: style.orb }}
      />

      <div className="relative flex items-start gap-4">
        {/* Gradient icon badge */}
        <div className={`p-3 rounded-xl ${style.iconBg} shadow-md flex-shrink-0`}>
          <span className="text-xl leading-none">{style.emoji}</span>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Your coach says
          </p>
          <p className={`text-sm leading-relaxed font-medium ${style.text}`}>
            {nudge}
          </p>
        </div>
      </div>
    </div>
  );
}
