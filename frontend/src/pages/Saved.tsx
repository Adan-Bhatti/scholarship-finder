import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { getSavedScholarships } from '../api/scholarships';
import { Scholarship } from '../types';

export function Saved() {
  const [saved, setSaved] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await getSavedScholarships();
      setSaved(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Saved Scholarships</h2>
            <p className="text-gray-500 mt-2">Manage your bookmarked opportunities</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No saved scholarships</h3>
              <p className="text-gray-500">Go to your dashboard to discover and save matches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {saved.map(scholarship => (
                <ScholarshipCard 
                  key={scholarship.id} 
                  match={{ scholarship, match_score: 100 }} // Dummy match_score for saved view
                  isSavedInitial={true}
                  onUpdate={fetchSaved} // Refresh list on unsave
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
