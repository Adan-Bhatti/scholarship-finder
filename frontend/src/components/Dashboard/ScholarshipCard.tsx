import React, { useState } from 'react';
import { BookmarkIcon, ExternalLinkIcon, EyeIcon, AlertCircleIcon, CalendarIcon, TrophyIcon } from 'lucide-react';
import type { MatchResult } from '../../types';
import { saveScholarship, unsaveScholarship } from '../../api/scholarships';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getDeadlineUrgency } from '../../utils/date';
import { DetailModal } from '../ScholarshipDetail/DetailModal';
import toast from 'react-hot-toast';

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
        toast.success('Removed from saved');
      } else {
        await saveScholarship(scholarship.id);
        setIsSaved(true);
        toast.success('Scholarship saved! ✓');
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update saved status');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = () => {
    if (!scholarship.amount_max && !scholarship.amount_min) return 'Fully Funded';
    const currency = scholarship.currency || 'USD';
    if (scholarship.amount_min && scholarship.amount_max && scholarship.amount_min !== scholarship.amount_max) {
      return `${formatCurrency(scholarship.amount_min, currency)} – ${formatCurrency(scholarship.amount_max, currency)}`;
    }
    return formatCurrency(scholarship.amount_max || scholarship.amount_min, currency);
  };

  const formattedDeadline = formatDate(scholarship.deadline);
  const urgency = getDeadlineUrgency(scholarship.deadline);

  const urgencyConfig = {
    critical: { bg: 'bg-red-50 border border-red-100', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: <AlertCircleIcon size={11} className="inline mr-1" /> },
    soon: { bg: 'bg-orange-50 border border-orange-100', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', icon: <CalendarIcon size={11} className="inline mr-1" /> },
    normal: { bg: 'bg-slate-50 border border-slate-100', text: 'text-slate-700', badge: null, icon: null },
    none: { bg: 'bg-slate-50 border border-slate-100', text: 'text-slate-500', badge: null, icon: null },
  };
  const urg = urgencyConfig[urgency];

  const matchPct = match.match_score || 0;
  const matchColor = matchPct >= 80 ? 'bg-emerald-500' : matchPct >= 60 ? 'bg-blue-500' : matchPct >= 40 ? 'bg-amber-500' : 'bg-slate-300';

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-3 min-w-0">
              <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1 line-clamp-2">
                {scholarship.title}
              </h3>
              <p className="text-xs font-semibold text-blue-600 truncate">{scholarship.provider}</p>
            </div>
            <button
              onClick={toggleSave}
              disabled={loading}
              aria-label={isSaved ? 'Unsave' : 'Save'}
              className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                isSaved
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 shadow-sm'
                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
              } ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <BookmarkIcon size={18} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Match score bar */}
          {matchPct > 0 && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <TrophyIcon size={10} /> Match Score
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  matchPct >= 80 ? 'bg-emerald-50 text-emerald-700' : matchPct >= 60 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'
                }`}>
                  {matchPct}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${matchColor} transition-all duration-700`}
                  style={{ width: `${matchPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Amount + Deadline */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Award Amount</p>
              <p className="font-bold text-slate-900 text-sm leading-tight">{formatAmount()}</p>
              {scholarship.currency && scholarship.currency !== 'USD' && (
                <p className="text-[10px] text-slate-400 mt-0.5">{scholarship.currency} — check rate</p>
              )}
            </div>
            <div className={`${urg.bg} p-2.5 rounded-xl`}>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Deadline</p>
              <p className={`font-bold text-sm leading-tight ${urg.text}`}>
                {urg.icon}{formattedDeadline}
              </p>
              {urgency === 'critical' && (
                <p className="text-[10px] text-red-600 mt-0.5 font-semibold">⚠ &lt; 30 days!</p>
              )}
              {urgency === 'soon' && (
                <p className="text-[10px] text-orange-600 mt-0.5">Closing soon</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
            {scholarship.description || 'Click View Details to read more on the official scholarship website.'}
          </p>

          {/* Degree tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {scholarship.degree_levels?.slice(0, 3).map(level => (
              <span key={level} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                {level}
              </span>
            ))}
            {(scholarship.degree_levels?.length || 0) > 3 && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg font-medium">
                +{(scholarship.degree_levels?.length || 0) - 3}
              </span>
            )}
          </div>

          {/* Saved notes */}
          {savedNotes && (
            <div className="mb-3 bg-amber-50 border border-amber-100 border-l-4 border-l-amber-400 p-2.5 rounded-lg">
              <p className="text-xs text-amber-800 italic">"{savedNotes}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors gap-1 group-hover:gap-1.5 transition-all"
            >
              <EyeIcon size={14} />
              View Details & AI Explainer
            </button>
            {scholarship.application_url && (
              <a
                href={scholarship.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs text-slate-400 hover:text-slate-700 transition-colors gap-1 font-medium"
              >
                <ExternalLinkIcon size={12} />
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
