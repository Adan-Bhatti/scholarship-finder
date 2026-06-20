import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { searchScholarships, SearchParams, SearchResponse } from '../api/search';
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function Explorer() {
  const [params, setParams] = useState<SearchParams>({ page: 1, limit: 20 });
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Local state for debounced search input
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({ ...prev, q: searchTerm, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch results when params change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const result = await searchScholarships(params);
        setData(result);
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Failed to search scholarships');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [params]);

  const handleFilterChange = (key: keyof SearchParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setParams({ page: 1, limit: 20 });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Scholarships</h1>
            <p className="text-gray-500">Search and filter through our global database of opportunities.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filters Sidebar (Left) */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <FilterIcon size={18} className="mr-2" />
                    Filters
                  </h3>
                  <button 
                    onClick={handleClearFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree Level</label>
                    <select 
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2.5 text-sm"
                      value={params.degree || ''}
                      onChange={(e) => handleFilterChange('degree', e.target.value)}
                    >
                      <option value="">Any Degree</option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="Postdoc">Postdoctoral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select 
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2.5 text-sm"
                      value={params.country || ''}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                    >
                      <option value="">Any Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount (USD)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 5000"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2.5 text-sm"
                      value={params.min_amount || ''}
                      onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Area (Right) */}
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by keyword, provider, or title..."
                  className="block w-full pl-11 pr-4 py-4 border-transparent rounded-2xl shadow-sm text-gray-900 bg-white border border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-shadow hover:shadow-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Results Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {loading ? 'Searching...' : (
                    <>Showing <strong>{data?.data.length || 0}</strong> of <strong>{data?.total || 0}</strong> results</>
                  )}
                </p>
                
                {data && data.total > (params.limit || 20) && (
                   <div className="flex gap-2">
                     <button 
                        disabled={params.page === 1 || loading}
                        onClick={() => handleFilterChange('page', (params.page || 1) - 1)}
                        className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50"
                     >
                       Prev
                     </button>
                     <button 
                        disabled={(params.page || 1) * (params.limit || 20) >= data.total || loading}
                        onClick={() => handleFilterChange('page', (params.page || 1) + 1)}
                        className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50"
                     >
                       Next
                     </button>
                   </div>
                )}
              </div>

              {/* Results Grid */}
              {loading && !data ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : data?.data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <SearchIcon size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No scholarships found</h3>
                  <p className="text-gray-500">Try adjusting your search or clearing some filters.</p>
                  <button 
                    onClick={handleClearFilters}
                    className="mt-6 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
                  {data?.data.map((scholarship) => (
                    <ScholarshipCard
                      key={scholarship.id}
                      match={{ scholarship, match_score: 0 }} // We pass 0 as score since this is a general search, not a match
                    />
                  ))}
                </div>
              )}
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
