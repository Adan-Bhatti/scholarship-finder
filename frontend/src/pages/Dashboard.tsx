import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { getMatches, getSavedScholarships } from '../api/scholarships';
import { getDashboardStats, DashboardStats } from '../api/dashboard';
import { MatchResult } from '../types';
import { formatCurrency } from '../utils/currency';
import { TargetIcon, BookmarkIcon, ClockIcon, BanknoteIcon, AlertCircleIcon, RefreshCwIcon, MailWarningIcon, CheckCircle2Icon } from 'lucide-react';

export function Dashboard() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => {
    return localStorage.getItem('email_verified') === 'true';
  });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Handle OAuth redirect tokens
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    if (token) {
      localStorage.setItem('token', token);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    async function fetchData() {
      try {
        setLoading(true);
        // Fetch matches, saved scholarships, and stats concurrently
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

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('email_verified', 'true');
      setIsEmailVerified(true);
      setIsVerifying(false);
      toast.success('Email verified successfully! Advanced features unlocked.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {!isEmailVerified && (
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <MailWarningIcon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Verify your email address</h3>
                  <p className="text-blue-100 text-sm">Please verify your email to unlock all advanced AI matching features.</p>
                </div>
              </div>
              <button 
                onClick={handleVerifyEmail}
                disabled={isVerifying}
                className="bg-white text-blue-700 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-50 transition-colors disabled:opacity-80 flex items-center"
              >
                {isVerifying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <CheckCircle2Icon size={18} className="mr-2" />
                )}
                {isVerifying ? 'Verifying...' : 'Verify Now'}
              </button>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-blue-50 p-4 rounded-xl mr-4">
                  <TargetIcon className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_matches}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-green-50 p-4 rounded-xl mr-4">
                  <BookmarkIcon className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Saved Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.saved_count}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-orange-50 p-4 rounded-xl mr-4">
                  <ClockIcon className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Expiring Soon (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiring_soon_count}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-purple-50 p-4 rounded-xl mr-4">
                  <BanknoteIcon className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Potential Funding</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_funding_potential, "USD")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
              <p className="text-gray-500 mt-2">Based on your academic profile and preferences</p>
            </div>
            <button
              onClick={handleRefreshFeed}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCwIcon size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <AlertCircleIcon className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Make sure your profile is complete with your nationality, degree level, and target destinations to get personalized scholarship matches.
              </p>
              <Link 
                to="/profile"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Your Profile →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
