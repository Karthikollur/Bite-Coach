// app/signup/page.js
// What: New user sign-up page with email + password.
// Why 'use client': The form uses useState for input values and event handlers.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignup(e) {
    e.preventDefault(); // Prevent the browser's default form submit (page refresh)
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        // Translate Supabase error messages into friendly language
        if (signupError.message.includes('already registered')) {
          throw new Error('This email is already registered. Try logging in instead.');
        }
        if (signupError.message.includes('Password should be')) {
          throw new Error('Password must be at least 6 characters.');
        }
        throw new Error(signupError.message);
      }

      // Success — redirect to onboarding to collect personal details
      router.push('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {/* App logo at top */}
      <div className="mb-8 text-center">
        <span className="text-4xl">🥗</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Bite Coach</h1>
        <p className="text-gray-500 text-sm mt-1">Create your free account</p>
      </div>

      {/* Signup form card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:text-green-700">
            Log in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        Calorie estimates are approximate. Always label them as such.
        Consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}
