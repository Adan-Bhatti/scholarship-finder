import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { profileApi } from '../api/profile';
import { Profile } from '../types';
import { getIncomeBracketsForCountry } from '../utils/incomeBrackets';

export function ProfileView() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setIsNewProfile(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setIsNewProfile(true);
      } else {
        console.error('Failed to load profile', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'gpa' || name === 'graduation_year' || name === 'max_sources' ? Number(value) : value
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'extracurriculars' | 'target_destinations') => {
    const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
    setProfile(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Front-end validations
    if (!profile.degree_level) {
      setMessage({ type: 'error', text: 'Degree level is required.' });
      return;
    }
    if (profile.gpa === undefined || profile.gpa === null || isNaN(profile.gpa)) {
      setMessage({ type: 'error', text: 'GPA is required.' });
      return;
    }
    if (profile.gpa < 0.0 || profile.gpa > 4.0) {
      setMessage({ type: 'error', text: 'GPA must be between 0.0 and 4.0.' });
      return;
    }
    if (!profile.graduation_year) {
      setMessage({ type: 'error', text: 'Graduation year is required.' });
      return;
    }
    if (profile.graduation_year < 1900 || profile.graduation_year > 2100) {
      setMessage({ type: 'error', text: 'Graduation year must be between 1900 and 2100.' });
      return;
    }
    const maxS = profile.max_sources !== undefined ? profile.max_sources : 5;
    if (maxS < 1 || maxS > 50) {
      setMessage({ type: 'error', text: 'Max sources must be between 1 and 50.' });
      return;
    }
    if (!profile.nationality || !profile.nationality.trim()) {
      setMessage({ type: 'error', text: 'Nationality is required.' });
      return;
    }
    if (!profile.country_of_residence || !profile.country_of_residence.trim()) {
      setMessage({ type: 'error', text: 'Country of residence is required.' });
      return;
    }

    setIsSaving(true);
    try {
      // Exclude read-only fields
      const { id, user_id, updated_at, ...updateData } = profile as any;
      
      if (isNewProfile) {
        await profileApi.createProfile(updateData);
        setIsNewProfile(false);
        setMessage({ type: 'success', text: 'Profile created successfully!' });
      } else {
        await profileApi.updateProfile(updateData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to save profile. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF resumes are supported.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);
    try {
      const updatedProfile = await profileApi.uploadResume(file);
      setProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Resume parsed and profile updated successfully!' });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to upload and parse resume.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset file input
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
              <p className="text-gray-500 mt-2">View and update your matching preferences to get better scholarship recommendations.</p>
            </div>
            {!isNewProfile && profile.id && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/p/${profile.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Public profile link copied to clipboard!');
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg shadow-sm hover:bg-slate-50 flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Profile
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Resume</h3>
            <p className="text-sm text-gray-500 mb-4">Upload your PDF resume to automatically fill out your profile details using our AI parser.</p>
            <div className="flex items-center">
              <label className="relative cursor-pointer bg-blue-50 text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors">
                <span>{isUploading ? 'Parsing Resume...' : 'Select PDF Resume'}</span>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleResumeUpload} disabled={isUploading || isNewProfile} />
              </label>
              {isNewProfile && (
                <span className="ml-4 text-sm text-amber-600">Please fill out basic details and click Save before uploading a resume.</span>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree Level</label>
                  <select name="degree_level" value={profile.degree_level || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Level</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="High School">High School</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input type="text" name="field_of_study" value={profile.field_of_study || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Computer Science" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <input type="number" step="0.01" min="0" max="4" name="gpa" value={profile.gpa || ''} onChange={handleChange} onWheel={(e) => e.currentTarget.blur()} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 3.8" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <input type="number" min="1900" max="2100" name="graduation_year" value={profile.graduation_year || ''} onChange={handleChange} onWheel={(e) => e.currentTarget.blur()} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2025" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Sources to Match</label>
                  <input type="number" name="max_sources" min="1" max="50" value={profile.max_sources !== undefined ? profile.max_sources : 5} onChange={handleChange} onWheel={(e) => e.currentTarget.blur()} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input type="text" name="nationality" value={profile.nationality || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. United States" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                  <input type="text" name="country_of_residence" value={profile.country_of_residence || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Canada" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={profile.gender || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income Bracket</label>
                  <select name="income_bracket" value={profile.income_bracket || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Bracket</option>
                    {getIncomeBracketsForCountry(profile.country_of_residence).map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extracurriculars (comma separated)</label>
                  <input type="text" value={profile.extracurriculars?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'extracurriculars')} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Debate Club, Robotics, Volunteering" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Destinations (comma separated)</label>
                  <input type="text" value={profile.target_destinations?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'target_destinations')} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="UK, USA, Canada" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
