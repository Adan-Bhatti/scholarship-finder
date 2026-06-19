import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { getMatches, getSavedScholarships } from '../api/scholarships';
import { getDashboardStats, DashboardStats } from '../api/dashboard';
import { MatchResult } from '../types';
import { formatCurrency } from '../utils/currency';
import { TargetIcon, BookmarkIcon, ClockIcon, BanknoteIcon } from 'lucide-react';

export function Dashboard() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
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

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-500 mt-2">Based on your academic profile and preferences</p>
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
              <h3 className="text-xl font-medium text-gray-900 mb-2">No perfect matches yet</h3>
              <p className="text-gray-500">We are constantly scraping new scholarships. Check back later!</p>
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
