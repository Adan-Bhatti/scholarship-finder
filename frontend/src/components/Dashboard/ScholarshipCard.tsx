import React, { useState } from 'react';
import { BookmarkIcon, ExternalLinkIcon, EyeIcon, AlertCircleIcon, CalendarIcon } from 'lucide-react';
import type { Scholarship, MatchResult } from '../../types';
import { saveScholarship, unsaveScholarship } from '../../api/scholarships';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getDeadlineUrgency } from '../../utils/date';
import { DetailModal } from '../ScholarshipDetail/DetailModal';

interface ScholarshipCardProps {
  match: MatchResult;
  isSavedInitial?: boolean;
  onUpdate?: () => void;
  savedNotes?: string;
}

export function ScholarshipCard({ match, isSavedInitial = false, onUpdate, savedNotes }: ScholarshipCardProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const scholarship = match.scholarship;

  const toggleSave = async () => {
    try {
      setLoading(true);
      if (isSaved) {
        await unsaveScholarship(scholarship.id);
        setIsSaved(false);
      } else {
        await saveScholarship(scholarship.id);
        setIsSaved(true);
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to update saved status");
    } finally {
      setLoading(false);
    }
  };

  // Format amount: show range if both exist, else just max
  const formatAmount = () => {
    if (!scholarship.amount_max && !scholarship.amount_min) return 'Fully Funded / Varies';
    const currency = scholarship.currency || 'USD';
    if (scholarship.amount_min && scholarship.amount_max && scholarship.amount_min !== scholarship.amount_max) {
      return `${formatCurrency(scholarship.amount_min, currency)} – ${formatCurrency(scholarship.amount_max, currency)}`;
    }
    return formatCurrency(scholarship.amount_max || scholarship.amount_min, currency);
  };

  const formattedDeadline = formatDate(scholarship.deadline);
  const urgency = getDeadlineUrgency(scholarship.deadline);

  const urgencyConfig = {
    critical: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircleIcon size={12} className="inline mr-1" /> },
    soon: { bg: 'bg-orange-50', text: 'text-orange-700', icon: <CalendarIcon size={12} className="inline mr-1" /> },
    normal: { bg: 'bg-slate-50', text: 'text-gray-700', icon: null },
    none: { bg: 'bg-slate-50', text: 'text-gray-500', icon: null },
  };
  const urg = urgencyConfig[urgency];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-2">
              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{scholarship.title}</h3>
              <p className="text-sm font-medium text-blue-600">{scholarship.provider}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              {match.match_score > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {match.match_score}% Match
                </span>
              )}
              <button
                onClick={toggleSave}
                disabled={loading}
                aria-label={isSaved ? 'Unsave scholarship' : 'Save scholarship'}
                className={`mt-2 p-2 rounded-full transition-colors ${isSaved ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-gray-600'}`}
              >
                <BookmarkIcon size={20} className={isSaved ? 'fill-current' : ''} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Amount */}
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Award Amount</p>
              <p className="font-bold text-gray-900 text-sm">{formatAmount()}</p>
              {scholarship.currency && scholarship.currency !== 'USD' && (
                <p className="text-xs text-gray-400 mt-0.5">{scholarship.currency} — check current rate</p>
              )}
            </div>
            {/* Deadline */}
            <div className={`${urg.bg} p-3 rounded-lg`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Deadline</p>
              <p className={`font-bold text-sm ${urg.text}`}>
                {urg.icon}{formattedDeadline}
              </p>
              {urgency === 'critical' && (
                <p className="text-xs text-red-600 mt-0.5 font-medium">Less than 30 days!</p>
              )}
              {urgency === 'soon' && (
                <p className="text-xs text-orange-600 mt-0.5">Closing soon</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-3">
              {scholarship.description || 'No description provided. Click to view details on the official website.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {scholarship.degree_levels?.slice(0, 3).map(level => (
              <span key={level} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                {level}
              </span>
            ))}
            {(scholarship.degree_levels?.length || 0) > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                +{(scholarship.degree_levels?.length || 0) - 3} more
              </span>
            )}
          </div>

          {savedNotes && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md">
              <p className="text-sm text-yellow-800 italic">"{savedNotes}"</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <EyeIcon size={16} className="mr-1" />
              View Details & AI Explainer
            </button>
            {scholarship.application_url && (
              <a
                href={scholarship.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ExternalLinkIcon size={14} className="mr-1" />
                Apply
              </a>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <DetailModal
          scholarship={scholarship}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
