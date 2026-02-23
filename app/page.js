// app/page.js
// What: The landing page — the first thing people see at bitecoach.app (or localhost:3000).
// Why: A clear value proposition page that explains what the app does and
//      drives people to sign up. Phone-first design — big text, one clear CTA.

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="text-xl font-bold text-gray-900">Bite Coach</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <main className="max-w-lg mx-auto px-6 pt-16 pb-24 text-center">
        {/* Emoji hero — food-forward, warm */}
        <div className="text-6xl mb-6">📸</div>

        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
          Snap your meal.<br />
          <span className="text-green-500">Get coached.</span>
        </h1>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Photo → calories → coaching. In seconds.
        </p>

        {/* Primary CTA */}
        <Link
          href="/signup"
          className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors shadow-sm"
        >
          Start for free — no credit card
        </Link>

        <p className="mt-3 text-sm text-gray-500">
          Takes 2 minutes to set up · 100% free
        </p>

        {/* ─── How it works ─── */}
        <div className="mt-16 space-y-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            How it works
          </h2>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Set your goal</h3>
              <p className="text-gray-600 text-sm mt-1">
                Enter your details in 2 minutes. We calculate your personal calorie
                and nutrition targets using the gold-standard Mifflin-St Jeor formula.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Snap your meal</h3>
              <p className="text-gray-600 text-sm mt-1">
                Take a photo of your food — even home-cooked Indian, Asian, or mixed
                dishes. Our AI identifies every item and estimates calories in seconds.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Get coached</h3>
              <p className="text-gray-600 text-sm mt-1">
                After every meal, your personal coach tells you what to adjust —
                specific food suggestions, not vague advice. Like having a nutritionist
                in your pocket.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Social proof / trust signals ─── */}
        <div className="mt-16 p-6 bg-green-50 rounded-2xl text-left">
          <p className="text-gray-700 italic leading-relaxed">
            &ldquo;Finally an app that works with my Indian cooking. It recognized
            dal tadka, sabzi, everything — and actually tells me what to eat next,
            not just the calories.&rdquo;
          </p>
          <p className="mt-3 text-sm text-gray-500 font-medium">— Early tester</p>
        </div>

        {/* ─── Bottom CTA ─── */}
        <div className="mt-12">
          <Link
            href="/signup"
            className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-400">
        <p>Bite Coach · Calorie estimates are approximate · Always consult a professional for medical advice</p>
      </footer>
    </div>
  );
}
