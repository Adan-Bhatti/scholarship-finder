import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { getMatches, getSavedScholarships } from '../api/scholarships';
import { getDashboardStats, DashboardStats } from '../api/dashboard';
import { MatchResult } from '../types';
import { formatCurrency } from '../utils/currency';
import { TargetIcon, BookmarkIcon, ClockIcon, BanknoteIcon, AlertCircleIcon, RefreshCwIcon, SparklesIcon } from 'lucide-react';

// --- Animated counter hook ---
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// --- Skeleton card ---
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-28" />
        </div>
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-24" />
        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-24" />
      </div>
      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full mb-2" />
      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
    </div>
  );
}

// --- Stat card with animated counter ---
function StatCard({ icon, label, value, color, darkColor, prefix = '', suffix = '' }: {
  icon: React.ReactNode; label: string; value: number;
  color: string; darkColor?: string; prefix?: string; suffix?: string;
}) {
  const count = useCountUp(value, 800);
  return (
    <div className={`bg-white dark:bg-slate-800/70 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-slate-200 dark:hover:border-indigo-500/40 transition-all group`}>
      <div className={`${color} ${darkColor || ''} p-3.5 rounded-xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{prefix}{count.toLocaleString()}{suffix}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    if (token) {
      localStorage.setItem('token', token);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [matchedData, savedData, statsData] = await Promise.all([
          getMatches(),
          getSavedScholarships(),
          getDashboardStats()
        ]);
        setMatches(matchedData);
        setSavedIds(new Set(savedData.map(s => s.scholarship?.id || s.id)));
        setStats(statsData);
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err.message || 'Failed to load dashboard data';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleRefreshFeed = async () => {
    setLoading(true);
    try {
      const [matchedData, savedData, statsData] = await Promise.all([
        getMatches(),
        getSavedScholarships(),
        getDashboardStats()
      ]);
      setMatches(matchedData);
      setSavedIds(new Set(savedData.map(s => s.scholarship?.id || s.id)));
      setStats(statsData);
      toast.success('Dashboard refreshed!');
    } catch (err: any) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <SparklesIcon size={22} className="text-indigo-500" />
                Your Dashboard
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">AI-matched opportunities based on your profile</p>
            </div>
            <button
              onClick={handleRefreshFeed}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all disabled:opacity-50 text-sm"
            >
              <RefreshCwIcon size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<TargetIcon className="text-blue-600 dark:text-blue-400" size={20} />}
                label="Total Matches"
                value={stats.total_matches}
                color="bg-blue-50"
                darkColor="dark:bg-blue-900/30"
              />
              <StatCard
                icon={<BookmarkIcon className="text-emerald-600 dark:text-emerald-400" size={20} />}
                label="Saved"
                value={stats.saved_count}
                color="bg-emerald-50"
                darkColor="dark:bg-emerald-900/30"
              />
              <StatCard
                icon={<ClockIcon className="text-orange-600 dark:text-orange-400" size={20} />}
                label="Expiring Soon"
                value={stats.expiring_soon_count}
                color="bg-orange-50"
                darkColor="dark:bg-orange-900/30"
              />
              <div className="bg-white dark:bg-slate-800/70 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-slate-200 dark:hover:border-indigo-500/40 transition-all group">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-3.5 rounded-xl group-hover:scale-110 transition-transform">
                  <BanknoteIcon className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-0.5">Potential Funding</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-display">{formatCurrency(stats.total_funding_potential, 'USD')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Matches */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended for You</h3>
              <p className="text-slate-500 text-sm mt-0.5">Based on your academic profile and preferences</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800/50 text-sm">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl mb-4">
                <AlertCircleIcon className="text-indigo-500" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No matches yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
                Make sure your profile is complete with your nationality, degree level, and target destinations to get personalized scholarship matches.
              </p>
              <Link
                to="/profile"
                className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
              >
                Complete Your Profile →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {matches.map(match => (
                <ScholarshipCard
                  key={match.scholarship.id}
                  match={match}
                  isSavedInitial={savedIds.has(match.scholarship.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
