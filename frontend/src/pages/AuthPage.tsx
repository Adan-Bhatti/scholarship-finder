import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 flex flex-col items-center justify-center">
          <img src="/logo.png" alt="ScholarshipAI Logo" className="w-20 h-20 mb-4 rounded-2xl shadow-lg border border-white/10" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            ScholarshipAI
          </h1>
          <p className="text-slate-400 mt-2 text-sm">AI-powered scholarship matching</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex rounded-lg bg-white/10 p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                type="email"
                id="auth-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  id="auth-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'forgot_password' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Back to login
                </button>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'register' ? (
                'Create Account'
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Social Logins */}
          {mode !== 'forgot_password' && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <span className="w-1/5 border-b border-white/20 lg:w-1/4"></span>
                <span className="text-xs text-center text-slate-400 uppercase">or login with</span>
                <span className="w-1/5 border-b border-white/20 lg:w-1/4"></span>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => window.location.href = 'http://localhost:8000/auth/google'}
                  className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center text-white text-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44-3.95 0-7.14-3.2-7.14-7.14 0-3.95 3.19-7.14 7.14-7.14 1.92 0 3.65.74 4.96 1.95l2.06-2.06C17.44 3.08 14.93 2 12.18 2 6.64 2 2.14 6.5 2.14 12s4.5 10 10.04 10c5.44 0 9.77-3.96 9.77-10 0-.61-.06-1.18-.17-1.73z" />
                    <path fill="#4285F4" d="M21.35 11.1h-9.17v2.73h6.51c-.26 1.5-1.09 2.76-2.28 3.58l3.65 2.83c2.14-1.97 3.39-4.87 3.39-8.15 0-.54-.05-1.07-.15-1.59" />
                    <path fill="#34A853" d="M12.18 22c2.72 0 5.01-.9 6.68-2.43l-3.65-2.83c-.91.61-2.06.97-3.32.97-2.73 0-5.06-1.84-5.88-4.32L2.24 16.3c1.71 3.4 5.25 5.7 9.94 5.7" />
                    <path fill="#FBBC05" d="M6.3 13.39c-.21-.61-.33-1.27-.33-1.95s.12-1.34.33-1.95V6.36H2.24A9.973 9.973 0 0 0 1.14 12c0 1.62.39 3.14 1.1 4.5l4.06-3.11" />
                    <path fill="#EA4335" d="M12.18 5.61c1.48 0 2.81.51 3.86 1.51l2.89-2.89C17.18 2.53 14.89 1.5 12.18 1.5 7.48 1.5 3.94 3.8 2.24 7.2l4.06 3.11c.82-2.48 3.15-4.32 5.88-4.32" />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => window.location.href = 'http://localhost:8000/auth/github'}
                  className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center text-white text-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Protected by JWT authentication. Your data is encrypted.
        </p>
      </div>
    </div>
  );
}
