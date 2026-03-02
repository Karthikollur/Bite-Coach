'use client';

import { useState } from "react";

const phases = [
  {
    id: 1,
    week: "Week 1–2",
    label: "Foundation Setup",
    color: "#FF6B35",
    accent: "#FF8C5A",
    icon: "⚙️",
    goal: "Get Expo project running with core screens",
    tasks: [
      { id: "1a", text: "Init Expo project with TypeScript template", done: false },
      { id: "1b", text: "Set up folder structure mirroring Next.js app", done: false },
      { id: "1c", text: "Install Expo Router, NativeWind (Tailwind for RN)", done: false },
      { id: "1d", text: "Configure environment variables (.env) for Gemini API key", done: false },
      { id: "1e", text: "Build Home screen skeleton with bottom tab navigation", done: false },
      { id: "1f", text: "Run on Android emulator + physical device via Expo Go", done: false },
    ],
    portfolio: "Working app skeleton on device — screenshot for LinkedIn",
  },
  {
    id: 2,
    week: "Week 3–4",
    label: "Camera + AI Core",
    color: "#7C3AED",
    accent: "#9D5FFF",
    icon: "🤖",
    goal: "Port the Gemini food-photo analysis flow",
    tasks: [
      { id: "2a", text: "Integrate expo-camera & expo-image-picker", done: false },
      { id: "2b", text: "Convert Next.js API route → React Native fetch call to Gemini", done: false },
      { id: "2c", text: "Display AI calorie breakdown on a Results screen", done: false },
      { id: "2d", text: "Handle loading states, error states gracefully", done: false },
      { id: "2e", text: "Test with 10 different food photos; fix prompt edge cases", done: false },
    ],
    portfolio: "Demo video: snap a meal → instant AI calorie breakdown",
  },
  {
    id: 3,
    week: "Week 5–6",
    label: "Data & Storage",
    color: "#059669",
    accent: "#10B981",
    icon: "💾",
    goal: "Persist food logs locally + daily summary",
    tasks: [
      { id: "3a", text: "Set up SQLite via expo-sqlite or Async Storage", done: false },
      { id: "3b", text: "Build food log CRUD (create, read, delete entries)", done: false },
      { id: "3c", text: "Daily calorie dashboard with progress ring", done: false },
      { id: "3d", text: "Weekly history screen with simple chart (Victory Native)", done: false },
      { id: "3e", text: "Optional: Supabase backend for cloud sync (big portfolio bonus)", done: false },
    ],
    portfolio: "Full CRUD app with persistent data — shows backend thinking",
  },
  {
    id: 4,
    week: "Week 7–8",
    label: "Polish + UX",
    color: "#DC2626",
    accent: "#F87171",
    icon: "✨",
    goal: "Make it feel like a real product",
    tasks: [
      { id: "4a", text: "Smooth animations with Reanimated 2 (entry/exit transitions)", done: false },
      { id: "4b", text: "Dark mode support with NativeWind", done: false },
      { id: "4c", text: "Haptic feedback on key actions (expo-haptics)", done: false },
      { id: "4d", text: "Empty state screens, onboarding flow (2–3 slides)", done: false },
      { id: "4e", text: "App icon + splash screen (use Expo's asset tools)", done: false },
      { id: "4f", text: "Fix all Android-specific layout quirks", done: false },
    ],
    portfolio: "Screen recordings showing polished UX — your strongest demo asset",
  },
  {
    id: 5,
    week: "Week 9–10",
    label: "Deploy + Portfolio",
    color: "#0EA5E9",
    accent: "#38BDF8",
    icon: "🚀",
    goal: "Ship it and make it hireable",
    tasks: [
      { id: "5a", text: "Build APK via EAS Build (Expo Application Services)", done: false },
      { id: "5b", text: "Deploy to Google Play Internal Testing track", done: false },
      { id: "5c", text: "Write a compelling README with GIF demos + tech stack badges", done: false },
      { id: "5d", text: "Create a 90-second Loom demo video for portfolio", done: false },
      { id: "5e", text: "Add Bite Coach as featured project on GitHub + LinkedIn", done: false },
    ],
    portfolio: "Live Play Store link — the ultimate credibility signal",
  },
  {
    id: 6,
    week: "Week 11–12",
    label: "Job Hunt Blitz",
    color: "#CA8A04",
    accent: "#FBBF24",
    icon: "🎯",
    goal: "Convert the project into offers",
    tasks: [
      { id: "6a", text: "Apply to 5 companies/freelance gigs per day with Bite Coach as anchor", done: false },
      { id: "6b", text: "Post a build-in-public thread on LinkedIn/X about the migration", done: false },
      { id: "6c", text: "Reach out to 10 Indian startups needing React Native devs (cold DM)", done: false },
      { id: "6d", text: "List on Upwork/Toptal: 'AI-powered mobile app dev'", done: false },
      { id: "6e", text: "Prep for interviews: system design, RN internals, Gemini API story", done: false },
      { id: "6f", text: "Consider extending to iOS for maximum marketability", done: false },
    ],
    portfolio: "Your pitch: 'I built a production AI mobile app in 10 weeks from scratch'",
  },
];

const techStack = [
  { label: "Expo + EAS", color: "#000" },
  { label: "Expo Router", color: "#7C3AED" },
  { label: "NativeWind", color: "#06B6D4" },
  { label: "Reanimated 2", color: "#FF6B35" },
  { label: "Google Gemini AI", color: "#4285F4" },
  { label: "expo-camera", color: "#059669" },
  { label: "SQLite / Supabase", color: "#3ECF8E" },
  { label: "EAS Build", color: "#CA8A04" },
];

export default function BiteCoachRoadmap() {
  const [tasks, setTasks] = useState(() => {
    const map = {};
    phases.forEach((p) => p.tasks.forEach((t) => (map[t.id] = false)));
    return map;
  });
  const [expanded, setExpanded] = useState({ 1: true });

  const toggle = (id) => setTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  const togglePhase = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const phaseProgress = (phase) => {
    const total = phase.tasks.length;
    const done = phase.tasks.filter((t) => tasks[t.id]).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  const totalDone = Object.values(tasks).filter(Boolean).length;
  const totalTasks = Object.values(tasks).length;
  const overallPct = Math.round((totalDone / totalTasks) * 100);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#0C0C0F",
        minHeight: "100vh",
        color: "#E8E8F0",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0C0C0F 0%, #1A1025 50%, #0C0C0F 100%)",
          borderBottom: "1px solid #222",
          padding: "40px 32px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🥗</span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#7C3AED",
              fontWeight: 700,
            }}
          >
            Bite Coach · Android Migration
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 38px)",
            fontWeight: 800,
            margin: "0 0 8px",
            lineHeight: 1.15,
            color: "#fff",
          }}
        >
          12-Week Dev Roadmap
        </h1>
        <p style={{ color: "#888", margin: "0 0 28px", fontSize: 15 }}>
          Next.js → Expo Android · Goal: Land a job/freelance client
        </p>

        {/* Overall progress */}
        <div
          style={{
            background: "#16161D",
            border: "1px solid #2A2A38",
            borderRadius: 12,
            padding: "16px 20px",
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            minWidth: 280,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#666",
                marginBottom: 8,
              }}
            >
              Overall Progress
            </div>
            <div
              style={{
                height: 6,
                background: "#2A2A38",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${overallPct}%`,
                  background: "linear-gradient(90deg, #7C3AED, #FF6B35)",
                  borderRadius: 99,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
              {overallPct}%
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>
              {totalDone}/{totalTasks} tasks
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Pills */}
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid #1A1A22",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginRight: 4 }}>
          Stack
        </span>
        {techStack.map((t) => (
          <span
            key={t.label}
            style={{
              fontSize: 12,
              padding: "4px 10px",
              background: "#16161D",
              border: "1px solid #2A2A38",
              borderRadius: 99,
              color: "#C0C0D0",
              fontWeight: 500,
            }}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* Phases */}
      <div style={{ padding: "24px 32px", maxWidth: 800 }}>
        {phases.map((phase) => {
          const { done, total, pct } = phaseProgress(phase);
          const isOpen = expanded[phase.id];
          const isComplete = done === total;

          return (
            <div
              key={phase.id}
              style={{
                marginBottom: 16,
                border: `1px solid ${isComplete ? phase.color + "55" : "#222"}`,
                borderRadius: 14,
                overflow: "hidden",
                background: isComplete
                  ? `linear-gradient(135deg, ${phase.color}08 0%, #0C0C0F 100%)`
                  : "#111116",
                transition: "border-color 0.3s",
              }}
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "left",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isComplete ? phase.color : "#1A1A22",
                    border: `2px solid ${phase.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                    transition: "background 0.3s",
                  }}
                >
                  {isComplete ? "✓" : phase.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: phase.color,
                        fontWeight: 700,
                      }}
                    >
                      {phase.week}
                    </span>
                    <span style={{ fontSize: 11, color: "#444" }}>Phase {phase.id}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#E8E8F0", marginTop: 2 }}>
                    {phase.label}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: done > 0 ? phase.color : "#444" }}>
                    {done}/{total}
                  </div>
                  <div
                    style={{
                      width: 60,
                      height: 4,
                      background: "#2A2A38",
                      borderRadius: 99,
                      marginTop: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: phase.color,
                        borderRadius: 99,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>

                <div style={{ color: "#555", fontSize: 14, marginLeft: 8 }}>
                  {isOpen ? "▲" : "▼"}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px" }}>
                  <div
                    style={{
                      background: "#0C0C0F",
                      border: `1px solid ${phase.color}33`,
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 16,
                      fontSize: 13,
                      color: "#AAA",
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: phase.color, flexShrink: 0 }}>→</span>
                    <span>
                      <strong style={{ color: "#CCC" }}>Goal: </strong>
                      {phase.goal}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {phase.tasks.map((task) => {
                      const checked = tasks[task.id];
                      return (
                        <label
                          key={task.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            cursor: "pointer",
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: checked ? `${phase.color}10` : "transparent",
                            border: `1px solid ${checked ? phase.color + "40" : "#1E1E28"}`,
                            transition: "all 0.2s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(task.id)}
                            style={{ display: "none" }}
                          />
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              border: `2px solid ${checked ? phase.color : "#444"}`,
                              background: checked ? phase.color : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 1,
                              transition: "all 0.2s",
                            }}
                          >
                            {checked && (
                              <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 14,
                              color: checked ? "#666" : "#C0C0D0",
                              textDecoration: checked ? "line-through" : "none",
                              lineHeight: 1.5,
                              transition: "all 0.2s",
                            }}
                          >
                            {task.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding: "10px 14px",
                      background: "#0A0A10",
                      borderLeft: `3px solid ${phase.color}`,
                      borderRadius: "0 8px 8px 0",
                      fontSize: 12,
                      color: "#888",
                    }}
                  >
                    <span style={{ color: phase.color, fontWeight: 700 }}>📌 Portfolio win: </span>
                    {phase.portfolio}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "24px 32px 40px",
          borderTop: "1px solid #1A1A22",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "🎓", label: "MCA Student", note: "Graduate 2026" },
          { icon: "⏱️", label: "Time budget", note: "~3 hrs/day + weekends" },
          { icon: "💼", label: "Target", note: "React Native / AI mobile roles" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 16px",
              background: "#111116",
              borderRadius: 10,
              border: "1px solid #1E1E28",
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#E8E8F0" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{item.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
