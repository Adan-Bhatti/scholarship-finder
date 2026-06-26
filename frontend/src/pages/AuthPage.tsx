import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://scholarship-finder-ai.onrender.com';

const features = [
  { icon: '🎓', text: 'AI-powered scholarship matching' },
  { icon: '🌍', text: '50+ global scholarship sources' },
  { icon: '⚡', text: 'Instant eligibility analysis' },
  { icon: '🔔', text: 'Deadline reminders & tracker' },
];

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        await apiClient.post('/auth/register', { email, password });
        toast.success('Account created! Please log in.');
        setMode('login');
      } else if (mode === 'forgot_password') {
        const { data } = await apiClient.post('/auth/request-reset', { email });
        toast.success(data.message || 'If that email exists, a reset link was sent.');
        setMode('login');
      } else {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const { data } = await apiClient.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        try {
          await apiClient.get('/profile');
          navigate('/dashboard');
        } catch {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className={`relative z-10 w-full max-w-5xl mx-auto px-4 py-8 flex gap-12 items-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Left side - branding */}
        <div className="hidden lg:flex flex-col flex-1 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                ScholarshipAI
              </h1>
              <p className="text-xs text-slate-400">Powered by Groq LLaMA 3</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Your personal AI<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              scholarship advisor
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Stop spending hours searching. Let AI match you to scholarships based on your exact profile.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['👨‍💻', '👩‍🎓', '👨‍🔬', '👩‍💼'].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-900 text-sm">
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-white font-semibold">500+</span> scholars found funding
            </p>
          </div>
        </div>

        {/* Right side - form */}
        <div className="w-full lg:max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                ScholarshipAI
              </h1>
            </div>
            <p className="text-slate-400 text-sm">AI-powered scholarship matching</p>
          </div>

          <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl">
            {/* Tab switcher */}
            {mode !== 'forgot_password' && (
              <div className="flex rounded-xl bg-black/20 p-1 mb-6">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {mode === 'forgot_password' && (
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">Reset Password</h3>
                <p className="text-slate-400 text-sm">Enter your email and we'll send a reset link.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  id="auth-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                />
              </div>

              {mode !== 'forgot_password' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="auth-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot_password')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {mode === 'forgot_password' && (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    ← Back to sign in
                  </button>
                </div>
              )}

              <button
                type="submit"
                id="auth-submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : mode === 'login' ? (
                  'Sign In →'
                ) : mode === 'register' ? (
                  'Create Free Account →'
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Social Logins */}
            {mode !== 'forgot_password' && (
              <>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => window.location.href = `${BACKEND_URL}/auth/google`}
                    className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5 flex items-center justify-center text-white text-xs font-medium gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.03 19.27 4.84 16.07 4.84 12.13c0-3.95 3.19-7.14 7.14-7.14 1.92 0 3.65.74 4.96 1.95l2.06-2.06C17.44 3.08 14.93 2 12.18 2 6.64 2 2.14 6.5 2.14 12s4.5 10 10.04 10c5.44 0 9.77-3.96 9.77-10 0-.61-.06-1.18-.17-1.73z" />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={() => window.location.href = `${BACKEND_URL}/auth/github`}
                    className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5 flex items-center justify-center text-white text-xs font-medium gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-slate-600 text-xs mt-4">
            Protected by JWT authentication • Your data is encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
