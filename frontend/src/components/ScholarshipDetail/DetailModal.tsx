import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipExplanation(scholarship.id);
        setAiData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to generate AI explanation');
      } finally {
        setLoading(false);
      }
    };
    fetchExplanation();
  }, [scholarship.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <XIcon size={24} />
        </button>

        <div className="p-8">
          <div className="mb-6 pr-12">
            <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
              {scholarship.title}
            </h2>
            <p className="text-lg font-medium text-blue-600">
              {scholarship.provider}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Amount</p>
              <p className="font-bold text-gray-900">{formatCurrency(scholarship.amount_max, scholarship.currency)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Deadline</p>
              <p className="font-bold text-gray-900">{formatDate(scholarship.deadline)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Min GPA</p>
              <p className="font-bold text-gray-900">{scholarship.gpa_requirement ? scholarship.gpa_requirement.toFixed(1) : 'None'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Renewable</p>
              <p className="font-bold text-gray-900">{scholarship.renewable ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* AI Explainer Section */}
          <div className="mb-8 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 overflow-hidden">
            <div className="bg-indigo-100/50 px-6 py-3 border-b border-indigo-100 flex items-center">
              <SparklesIcon size={20} className="text-indigo-600 mr-2" />
              <h3 className="font-semibold text-indigo-900">AI Eligibility Assessment</h3>
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
                <p className="text-red-500">{error}</p>
              ) : aiData ? (
                <div className="space-y-6">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {aiData.explanation}
                  </p>
                  
                  {aiData.checklist && aiData.checklist.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
                        <CheckCircleIcon size={18} className="mr-2" />
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {aiData.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700">{item}</span>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Overview</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {scholarship.description}
                </p>
              </section>
            )}

            {scholarship.eligibility_text && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Eligibility</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {scholarship.eligibility_text}
                </p>
              </section>
            )}
            
            <section className="flex flex-col gap-4 pt-6 border-t">
              <a 
                href={scholarship.application_url || scholarship.source_url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-lg"
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
