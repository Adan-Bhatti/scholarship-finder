import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileApi } from '../api/profile';
import { Profile } from '../types';
import { GraduationCapIcon, GlobeIcon, BookOpenIcon, DollarSignIcon, UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!id) return;
        setLoading(true);
        const data = await profileApi.getPublicProfile(id);
        setProfile(data);
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Failed to load public profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center flex-col">
        <UserIcon size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Profile Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">The profile you are looking for does not exist or is private.</p>
        <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900/50 dark:to-purple-900/50"></div>
          
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-16 bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 inline-block">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                <UserIcon size={48} className="text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            
            <div className="mt-14 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Student Profile</h1>
              <p className="text-gray-500 dark:text-slate-400 flex items-center mt-1">
                <GlobeIcon size={16} className="mr-2" />
                {profile.nationality || 'Unknown Nationality'} • Residing in {profile.country_of_residence || 'Unknown'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <GraduationCapIcon size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" /> Academic Background
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">Degree Level</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.degree_level || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">Field of Study</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.field_of_study || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">GPA</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.gpa || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">Graduation Year</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.graduation_year || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <DollarSignIcon size={16} className="mr-2 text-emerald-500 dark:text-emerald-400" /> Preferences & Details
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">Income Bracket</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.income_bracket || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">Gender</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.gender || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between pb-2">
                    <dt className="text-gray-500 dark:text-slate-400">Disability</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.disability || 'None'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <BookOpenIcon size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" /> Goals & Activities
              </h3>
              
              <div className="mb-4">
                <span className="block text-gray-500 dark:text-slate-400 text-sm mb-2">Target Destinations:</span>
                <div className="flex flex-wrap gap-2">
                  {profile.target_destinations?.length ? (
                    profile.target_destinations.map((dest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        {dest}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-slate-500">Not specified</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-gray-500 dark:text-slate-400 text-sm mb-2">Extracurriculars:</span>
                <div className="flex flex-wrap gap-2">
                  {profile.extracurriculars?.length ? (
                    profile.extracurriculars.map((activity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {activity}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-slate-500">Not specified</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
