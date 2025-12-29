'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    preferredThemes: [] as string[],
    sweetnessLevel: 'sweet' as 'sweet' | 'serious' | 'playful',
    contentMaturity: 'safe' as 'safe' | 'mature' | 'explicit',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  const themes = ['modern', 'fantasy', 'anime', 'sci-fi', 'historical', 'romance'];

  const toggleTheme = (theme: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredThemes: prev.preferredThemes.includes(theme)
        ? prev.preferredThemes.filter((t) => t !== theme)
        : [...prev.preferredThemes, theme],
    }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.put('/users/preferences', preferences);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-pink-600">Welcome to Amora!</h1>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">What themes interest you?</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {themes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => toggleTheme(theme)}
                  className={`p-4 rounded-lg border-2 transition ${
                    preferences.preferredThemes.includes(theme)
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200'
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">What's your preferred sweetness level?</h2>
            <div className="space-y-4 mb-6">
              {(['sweet', 'serious', 'playful'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setPreferences((prev) => ({ ...prev, sweetnessLevel: level }))}
                  className={`w-full p-4 rounded-lg border-2 transition ${
                    preferences.sweetnessLevel === level
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Content maturity level</h2>
            <p className="text-sm text-gray-600 mb-4">Choose the level of content you're comfortable with</p>
            <div className="space-y-4 mb-6">
              {(['safe', 'mature', 'explicit'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setPreferences((prev) => ({ ...prev, contentMaturity: level }))}
                  className={`w-full p-4 rounded-lg border-2 transition ${
                    preferences.contentMaturity === level
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

