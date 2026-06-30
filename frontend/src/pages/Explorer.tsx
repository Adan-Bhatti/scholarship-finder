import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { searchScholarships, SearchParams, SearchResponse } from '../api/search';
import { SearchIcon, FilterIcon, XIcon, ChevronDownIcon, RefreshCwIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Scholarship } from '../types';

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

export function Explorer() {
  const [params, setParams] = useState<SearchParams>({ page: 1, limit: 20 });
  const [data, setData] = useState<Scholarship[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && data.length < total) {
        setParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, data.length, total]);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setData([]); // clear data on new search
      setParams((prev) => ({ ...prev, q: searchTerm, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const result = await searchScholarships(params);
        setTotal(result.total);
        if (params.page === 1) {
          setData(result.data);
        } else {
          setData(prev => [...prev, ...result.data]);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Failed to search scholarships');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [params]);

  const handleRefreshFeed = async () => {
    setData([]);
    setParams({ ...params, page: 1 });
    toast.success('Feed refreshed!');
  };

  const handleFilterChange = (key: keyof SearchParams, value: any) => {
    setData([]); // clear data on new filter
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setData([]);
    setParams({ page: 1, limit: 20 });
  };

  const hasActiveFilters = !!(params.q || params.degree || params.country || params.min_amount);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">

          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-0.5">Explore Scholarships</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Search and filter through our global database of opportunities.</p>
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

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by keyword, provider, or title... (Ctrl+K)"
              className="block w-full pl-11 pr-10 py-3.5 rounded-2xl shadow-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 text-sm transition-all hover:shadow-md outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <XIcon className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              </button>
            )}
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {params.degree && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800/50">
                  🎓 {params.degree}
                  <button onClick={() => handleFilterChange('degree', undefined)} className="hover:text-blue-900 dark:hover:text-blue-200"><XIcon size={10} /></button>
                </span>
              )}
              {params.country && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-100 dark:border-emerald-800/50">
                  🌍 {params.country}
                  <button onClick={() => handleFilterChange('country', undefined)} className="hover:text-emerald-900 dark:hover:text-emerald-200"><XIcon size={10} /></button>
                </span>
              )}
              {params.field && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-100 dark:border-purple-800/50">
                  📚 {params.field}
                  <button onClick={() => handleFilterChange('field', undefined)} className="hover:text-purple-900 dark:hover:text-purple-200"><XIcon size={10} /></button>
                </span>
              )}
              {params.min_amount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-100 dark:border-amber-800/50">
                  💰 Min ${params.min_amount.toLocaleString()}
                  <button onClick={() => handleFilterChange('min_amount', undefined)} className="hover:text-amber-900 dark:hover:text-amber-200"><XIcon size={10} /></button>
                </span>
              )}
              <button onClick={handleClearFilters} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium px-2">
                Clear all
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">

            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800/70 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="font-semibold text-gray-900 dark:text-white flex items-center text-sm"
                  >
                    <FilterIcon size={16} className="mr-2" />
                    Filters
                    <ChevronDownIcon size={14} className={`ml-1 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {hasActiveFilters && (
                    <button onClick={handleClearFilters} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">
                      Clear all
                    </button>
                  )}
                </div>

                {filtersOpen && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Degree Level</label>
                      <select
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        value={params.degree || ''}
                        onChange={(e) => handleFilterChange('degree', e.target.value || undefined)}
                      >
                        <option value="">Any Degree</option>
                        {DEGREE_LEVELS.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Destination Country</label>
                      <select
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        value={params.country || ''}
                        onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                      >
                        <option value="">Any Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Field of Study</label>
                      <select
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        value={params.field || ''}
                        onChange={(e) => handleFilterChange('field', e.target.value || undefined)}
                      >
                        <option value="">Any Field</option>
                        {FIELDS_OF_STUDY.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Min Award (USD)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        value={params.min_amount || ''}
                        onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing <strong>{data.length}</strong> of <strong>{total}</strong> results
                </p>
              </div>

              {data.length === 0 && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-4 text-3xl">
                    🔍
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No scholarships found</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mb-5">Try adjusting your search terms or removing some filters.</p>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
                  {data.map((scholarship, index) => {
                    if (index === data.length - 1) {
                      return (
                        <div ref={lastElementRef} key={scholarship.id}>
                          <ScholarshipCard match={{ scholarship, match_score: 0 }} />
                        </div>
                      );
                    }
                    return (
                      <ScholarshipCard
                        key={scholarship.id}
                        match={{ scholarship, match_score: 0 }}
                      />
                    );
                  })}
                  {loading && (
                    <div className="col-span-1 xl:col-span-2 flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
