import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { GraduationCapIcon, GlobeIcon, ZapIcon, BellIcon, ShieldCheckIcon, ArrowRightIcon } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://scholarship-finder-ai.onrender.com';

const features = [
  { icon: <GraduationCapIcon size={18} />, text: 'AI-powered scholarship matching' },
  { icon: <GlobeIcon size={18} />, text: '50+ global scholarship sources' },
  { icon: <ZapIcon size={18} />, text: 'Instant eligibility analysis' },
  { icon: <BellIcon size={18} />, text: 'Deadline reminders & tracker' },
];

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
    <div className="min-h-screen flex w-full bg-white dark:bg-slate-950 font-sans">
      {/* Left side - Cover & Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/90 to-blue-900/90 z-10" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <GraduationCapIcon size={20} />
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight">ScholarshipAI</span>
          </div>
        </div>

        <div className="relative z-20 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
            Unlock your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">academic potential</span>
          </h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed font-light">
            Stop spending hours searching. Let our advanced AI match you to fully funded global scholarships tailored precisely to your profile.
          </p>

          <div className="space-y-5">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-200">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  {feature.icon}
                </div>
                <span className="font-medium text-slate-200">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-4 text-slate-400 text-sm">
          <div className="flex -space-x-3">
            {['👨‍💻', '👩‍🎓', '👨‍🔬'].map((emoji, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-900 text-base shadow-sm">
                {emoji}
              </div>
            ))}
          </div>
          <p>Join <strong className="text-white">10,000+</strong> students globally</p>
        </div>
      </div>

      {/* Right side - Form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white mb-4">
              <GraduationCapIcon size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">ScholarshipAI</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Your AI scholarship advisor</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl sm:border border-slate-200 dark:border-slate-800 rounded-3xl sm:p-8 sm:shadow-xl dark:shadow-2xl dark:shadow-indigo-500/5">
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : 'Reset password'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {mode === 'login' ? 'Enter your details to access your dashboard.' : mode === 'register' ? 'Join today and find your perfect match.' : 'We will send you instructions to reset your password.'}
              </p>
            </div>

            {mode !== 'forgot_password' && (
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                />
              </div>

              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot_password')}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                  />
                </div>
              )}

              {mode === 'forgot_password' && (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    ← Back to sign in
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] sm:text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : mode === 'login' ? (
                  <>Sign In <ArrowRightIcon size={16} /></>
                ) : mode === 'register' ? (
                  <>Create Account <ArrowRightIcon size={16} /></>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {mode !== 'forgot_password' && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = `${BACKEND_URL}/auth/google`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] text-slate-700 dark:text-slate-300 text-sm font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.03 19.27 4.84 16.07 4.84 12.13c0-3.95 3.19-7.14 7.14-7.14 1.92 0 3.65.74 4.96 1.95l2.06-2.06C17.44 3.08 14.93 2 12.18 2 6.64 2 2.14 6.5 2.14 12s4.5 10 10.04 10c5.44 0 9.77-3.96 9.77-10 0-.61-.06-1.18-.17-1.73z" />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={() => window.location.href = `${BACKEND_URL}/auth/github`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] text-slate-700 dark:text-slate-300 text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <ShieldCheckIcon size={14} className="text-emerald-500" />
              Protected by JWT authentication • Enterprise Grade Security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
