# Feedback Engine — Bite Coach

> The smart coaching system. This is the DIFFERENTIATOR — what makes Bite Coach more than just another tracker.

---

## When Feedback Triggers

1. **After every meal log** — real-time nudge based on running totals
2. **On dashboard load** — refresh current coaching message
3. **End of day** — summary nudge (displayed next morning)

---

## Input Data

The feedback function receives:
```javascript
{
  totalCalories,      // Today's total calories consumed
  targetCalories,     // User's daily calorie target
  totalProtein,       // Today's total protein (g)
  targetProtein,      // User's daily protein target (g)
  totalCarbs,         // Today's total carbs (g)
  targetCarbs,        // User's daily carbs target (g)
  totalFiber,         // Today's total fiber (g)
  targetFiber,        // User's daily fiber target (g)
  mealsCount,         // Number of meals logged today
  currentHour,        // Current hour (0-23) for time-aware nudges
  gender,             // For safety floor checks
}
```

---

## 7 Priority-Ranked Rules

The engine checks rules in order. **Show the FIRST match only** (highest priority).

### Rule 1: Calories Over Target
```javascript
if (totalCalories > targetCalories + 200) {
  return {
    type: 'calories_over',
    priority: 1,
    nudge: `You're over your calorie target today. Consider a lighter next meal or a walk after dinner!`,
    tone: 'gentle'
  };
}
```
**Tone:** Gentle, no shame. Suggest action, not guilt.

### Rule 2: Protein Too Low
```javascript
if (totalProtein < targetProtein * 0.5 && mealsCount >= 2) {
  return {
    type: 'protein_low',
    priority: 2,
    nudge: `Protein is running low today (${totalProtein}g of ${targetProtein}g). Try adding eggs, paneer, chicken, yogurt, or lentils to your next meal!`,
    tone: 'specific_suggestions'
  };
}
```
**Tone:** Specific food suggestions. Always include 3-5 options.

### Rule 3: Carbs Over Target
```javascript
if (totalCarbs > targetCarbs + 30) {
  return {
    type: 'carbs_high',
    priority: 3,
    nudge: `Carbs are a bit high today. For your next meal, consider swapping rice for salad or choosing a protein-heavy option.`,
    tone: 'practical_swaps'
  };
}
```
**Tone:** Practical swap suggestions, not restrictions.

### Rule 4: Under-Eating Warning
```javascript
if (totalCalories < targetCalories - 500 && currentHour >= 19) {
  return {
    type: 'under_eating',
    priority: 4,
    nudge: `You've only had ${totalCalories} calories today — that's quite low! Make sure to eat a proper dinner. Under-eating slows your metabolism.`,
    tone: 'caring'
  };
}
```
**Tone:** Caring. Prevent harmful under-eating.

### Rule 5: Perfect Balance 🌟
```javascript
const caloriesOnTrack = Math.abs(totalCalories - targetCalories) <= targetCalories * 0.1;
const proteinOnTrack = Math.abs(totalProtein - targetProtein) <= targetProtein * 0.1;
const carbsOnTrack = Math.abs(totalCarbs - targetCarbs) <= targetCarbs * 0.1;

if (caloriesOnTrack && proteinOnTrack && carbsOnTrack) {
  return {
    type: 'perfect_balance',
    priority: 5,
    nudge: `Amazing balance today! Your protein, carbs, and calories are all on track. Keep this up! 🌟`,
    tone: 'celebration'
  };
}
```
**Tone:** Celebration! Positive reinforcement is crucial for retention.

### Rule 6: Low Logging Reminder
```javascript
if (mealsCount <= 1 && currentHour >= 14) {
  return {
    type: 'low_logging',
    priority: 6,
    nudge: `Only one meal logged so far — don't forget to log your lunch and snacks! Consistent logging = better results.`,
    tone: 'encouraging_reminder'
  };
}
```
**Tone:** Encouraging reminder, not nagging.

### Rule 7: Default Encouragement
```javascript
// Always return something positive
return {
  type: 'default',
  priority: 7,
  nudge: `You're doing well! ${totalCalories} calories logged out of ${targetCalories}. Keep going — you've got this!`,
  tone: 'warm_encouragement'
};
```
**Tone:** Warm encouragement. Every interaction should feel positive.

---

## Complete Function (lib/feedback.js)

```javascript
// lib/feedback.js
// What: Generates personalized coaching nudges based on today's intake vs targets.
// Why: This is Bite Coach's differentiator — active coaching, not passive tracking.

export function generateFeedback({
  totalCalories, targetCalories,
  totalProtein, targetProtein,
  totalCarbs, targetCarbs,
  totalFiber, targetFiber,
  mealsCount, currentHour, gender
}) {
  // Safety check first (see Health Safety Rules below)
  const safetyNudge = checkHealthSafety({ totalCalories, targetCalories, gender });
  if (safetyNudge) return safetyNudge;

  // Priority 1: Calories over
  if (totalCalories > targetCalories + 200) {
    return {
      type: 'calories_over', priority: 1,
      nudge: `You're over your calorie target today. Consider a lighter next meal or a walk after dinner!`
    };
  }

  // Priority 2: Protein low
  if (totalProtein < targetProtein * 0.5 && mealsCount >= 2) {
    return {
      type: 'protein_low', priority: 2,
      nudge: `Protein is running low today (${Math.round(totalProtein)}g of ${targetProtein}g). Try adding eggs, paneer, chicken, yogurt, or lentils to your next meal!`
    };
  }

  // Priority 3: Carbs high
  if (totalCarbs > targetCarbs + 30) {
    return {
      type: 'carbs_high', priority: 3,
      nudge: `Carbs are a bit high today. For your next meal, consider swapping rice for salad or choosing a protein-heavy option.`
    };
  }

  // Priority 4: Under-eating
  if (totalCalories < targetCalories - 500 && currentHour >= 19) {
    return {
      type: 'under_eating', priority: 4,
      nudge: `You've only had ${totalCalories} calories today — that's quite low! Make sure to eat a proper dinner. Under-eating slows your metabolism.`
    };
  }

  // Priority 5: Perfect balance
  const calOk = Math.abs(totalCalories - targetCalories) <= targetCalories * 0.1;
  const proOk = Math.abs(totalProtein - targetProtein) <= targetProtein * 0.1;
  const carbOk = Math.abs(totalCarbs - targetCarbs) <= targetCarbs * 0.1;
  if (calOk && proOk && carbOk && mealsCount >= 2) {
    return {
      type: 'perfect_balance', priority: 5,
      nudge: `Amazing balance today! Your protein, carbs, and calories are all on track. Keep this up! 🌟`
    };
  }

  // Priority 6: Low logging
  if (mealsCount <= 1 && currentHour >= 14) {
    return {
      type: 'low_logging', priority: 6,
      nudge: `Only one meal logged so far — don't forget to log your lunch and snacks! Consistent logging = better results.`
    };
  }

  // Priority 7: Default
  const remaining = targetCalories - totalCalories;
  return {
    type: 'default', priority: 7,
    nudge: remaining > 0
      ? `You're doing well! ${totalCalories} calories logged out of ${targetCalories}. You have ${remaining} calories remaining. Keep going — you've got this!`
      : `You've reached your calorie target for today. Nice work staying on track!`
  };
}
```

---

## Health Safety Rules (Hard-Coded, Non-Negotiable)

```javascript
// These rules override ALL other feedback. They protect users from harm.

function checkHealthSafety({ totalCalories, targetCalories, gender }) {
  const minCalories = gender === 'female' ? 1200 : 1500;

  // NEVER suggest eating below safety floor
  if (targetCalories < minCalories) {
    return {
      type: 'safety_floor', priority: 0,
      nudge: `Your calorie target seems too low. For health and safety, we recommend at least ${minCalories} calories per day. Please consult a healthcare professional.`
    };
  }

  return null; // No safety issue
}
```

### Language Rules
- ✅ "Consider a lighter next meal"
- ✅ "Try adding eggs or paneer"
- ✅ "Great job staying on track!"
- ❌ "You ate too much" (shaming)
- ❌ "Bad food choices" (judgmental)
- ❌ "You cheated on your diet" (guilt-inducing)
- ❌ "You failed today" (discouraging)

### Banned Words in All Nudges
`bad`, `cheat`, `guilty`, `fat`, `failure`, `terrible`, `awful`, `disgusting`, `pig`, `lazy`

---

## Multi-Day Safety Check

Track patterns across days (checked on dashboard load):

```javascript
// If user logs <1,000 calories for 3+ consecutive days
if (consecutiveLowDays >= 3) {
  return {
    type: 'critical_safety',
    priority: 0,
    nudge: `Your calorie intake has been very low recently. Please consult a healthcare professional to make sure your nutrition plan is healthy.`
  };
}
```