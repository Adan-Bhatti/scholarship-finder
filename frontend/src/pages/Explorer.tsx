import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { searchScholarships, SearchParams, SearchResponse } from '../api/search';
import { SearchIcon, FilterIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'South Korea', 'Turkey', 'China', 'Switzerland',
  'Netherlands', 'Sweden', 'Saudi Arabia', 'Pakistan', 'India',
];

const FIELDS_OF_STUDY = [
  'Computer Science', 'Engineering', 'Medicine', 'Business', 'Law',
  'Arts & Humanities', 'Science', 'Social Sciences', 'Education',
  'Agriculture', 'Public Policy', 'Architecture',
];

const DEGREE_LEVELS = [
  { value: 'High School', label: 'High School' },
  { value: 'Undergraduate', label: 'Undergraduate' },
  { value: "Master's", label: "Master's" },
  { value: 'PhD', label: 'PhD' },
  { value: 'Postdoc', label: 'Postdoctoral' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'deadline', label: 'Deadline (Soonest)' },
];

export function Explorer() {
  const [params, setParams] = useState<SearchParams>({ page: 1, limit: 20 });
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Debounced search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({ ...prev, q: searchTerm, page: 1 }));
    }, 400);
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

  const hasActiveFilters = !!(params.q || params.degree || params.country || params.min_amount);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Explore Scholarships</h1>
            <p className="text-gray-500">Search and filter through our global database of opportunities.</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by keyword, provider, or title... (Ctrl+K)"
              className="block w-full pl-11 pr-10 py-4 border-transparent rounded-2xl shadow-sm text-gray-900 bg-white border border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-shadow hover:shadow-md"
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

          <div className="flex flex-col lg:flex-row gap-6">

            {/* Filters Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="font-semibold text-gray-900 flex items-center text-sm"
                  >
                    <FilterIcon size={16} className="mr-2" />
                    Filters
                    <ChevronDownIcon size={14} className={`ml-1 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {hasActiveFilters && (
                    <button onClick={handleClearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Clear all
                    </button>
                  )}
                </div>

                {filtersOpen && (
                  <div className="space-y-4">
                    {/* Degree */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Degree Level</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg bg-slate-50 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={params.degree || ''}
                        onChange={(e) => handleFilterChange('degree', e.target.value || undefined)}
                      >
                        <option value="">Any Degree</option>
                        {DEGREE_LEVELS.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Destination Country</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg bg-slate-50 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={params.country || ''}
                        onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                      >
                        <option value="">Any Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Field of Study */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Field of Study</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg bg-slate-50 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={(params as any).field || ''}
                        onChange={(e) => handleFilterChange('q' as any, e.target.value || undefined)}
                      >
                        <option value="">Any Field</option>
                        {FIELDS_OF_STUDY.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Min Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Min Award (USD)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        className="w-full border border-gray-200 rounded-lg bg-slate-50 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={params.min_amount || ''}
                        onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header */}
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
                      className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-slate-50"
                    >
                      ← Prev
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-500">
                      Page {params.page || 1}
                    </span>
                    <button
                      disabled={(params.page || 1) * (params.limit || 20) >= data.total || loading}
                      onClick={() => handleFilterChange('page', (params.page || 1) + 1)}
                      className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-slate-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* Grid */}
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
                      match={{ scholarship, match_score: 0 }}
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
