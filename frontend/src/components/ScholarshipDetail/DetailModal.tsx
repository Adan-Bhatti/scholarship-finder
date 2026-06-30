import React, { useEffect, useState, useCallback } from 'react';
import { XIcon, SparklesIcon, CheckCircleIcon, ExternalLinkIcon } from 'lucide-react';
import type { Scholarship } from '../../types';
import { getScholarshipExplanation } from '../../api/ai';
import type { AIExplanation } from '../../api/ai';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

interface DetailModalProps {
  scholarship: Scholarship;
  onClose: () => void;
}

export function DetailModal({ scholarship, onClose }: DetailModalProps) {
  const [aiData, setAiData] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipExplanation(scholarship.id);
        setAiData(data);
      } catch (err: any) {
        if (err.message === 'Network Error') {
          setError('Could not connect to the server. Please check your connection or ensure the backend is running.');
        } else {
          setError(err?.response?.data?.detail || err.message || 'Failed to generate AI explanation');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExplanation();
  }, [scholarship.id]);

  const formatAmount = () => {
    if (!scholarship.amount_max && !scholarship.amount_min) return 'Fully Funded / Varies';
    const currency = scholarship.currency || 'USD';
    if (scholarship.amount_min && scholarship.amount_max && scholarship.amount_min !== scholarship.amount_max) {
      return `${formatCurrency(scholarship.amount_min, currency)} – ${formatCurrency(scholarship.amount_max, currency)}`;
    }
    return formatCurrency(scholarship.amount_max || scholarship.amount_min, currency);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative border border-transparent dark:border-slate-700/50">
        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <XIcon size={24} />
        </button>

        <div className="p-8">
          <div className="mb-6 pr-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display leading-tight mb-2">
              {scholarship.title}
            </h2>
            <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
              {scholarship.provider}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Amount</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{formatAmount()}</p>
              {scholarship.currency && scholarship.currency !== 'USD' && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{scholarship.currency} currency</p>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Deadline</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{formatDate(scholarship.deadline)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Min GPA</p>
              <p className="font-bold text-gray-900 dark:text-white">{scholarship.gpa_requirement ? scholarship.gpa_requirement.toFixed(1) : 'None'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Renewable</p>
              <p className="font-bold text-gray-900 dark:text-white">{scholarship.renewable ? 'Yes ✓' : 'No'}</p>
            </div>
          </div>

          {/* AI Explainer Section */}
          <div className="mb-8 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
            <div className="bg-indigo-100/50 dark:bg-indigo-900/40 px-6 py-3 border-b border-indigo-100 dark:border-indigo-800/30 flex items-center">
              <SparklesIcon size={20} className="text-indigo-600 dark:text-indigo-400 mr-2" />
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">AI Eligibility Assessment</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center mb-3">
                    <div className="h-4 w-4 bg-indigo-200 rounded-full mr-2" />
                    <div className="h-3 w-48 bg-indigo-200 rounded" />
                  </div>
                  <div className="h-4 bg-indigo-100 rounded w-full" />
                  <div className="h-4 bg-indigo-100 rounded w-5/6" />
                  <div className="h-4 bg-indigo-100 rounded w-4/6" />
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center">
                        <div className="w-6 h-6 bg-indigo-200 rounded-full mr-3 flex-shrink-0" />
                        <div className="h-3 bg-indigo-100 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <p className="text-red-500 dark:text-red-400">{error}</p>
              ) : aiData ? (
                <div className="space-y-6">
                  <p className="text-gray-800 dark:text-slate-200 leading-relaxed text-lg">
                    {aiData.explanation}
                  </p>
                  
                  {aiData.checklist && aiData.checklist.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center">
                        <CheckCircleIcon size={18} className="mr-2" />
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {aiData.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700 dark:text-slate-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-8">
            {scholarship.description && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700/50 pb-2">Overview</h3>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {scholarship.description}
                </p>
              </section>
            )}

            {scholarship.eligibility_text && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700/50 pb-2">Eligibility</h3>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {scholarship.eligibility_text}
                </p>
              </section>
            )}
            
            <section className="flex flex-col gap-4 pt-6 border-t border-slate-200 dark:border-slate-700/50">
              <a 
                href={scholarship.application_url || scholarship.source_url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-lg"
              >
                Go to Official Application
                <ExternalLinkIcon size={20} className="ml-2" />
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
