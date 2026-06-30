import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { getSavedScholarships, updateSavedStatus } from '../api/scholarships';
import type { SavedScholarship, ApplicationStatus } from '../types';
import { PencilIcon, CheckIcon, XIcon } from 'lucide-react';

const STATUSES: ApplicationStatus[] = [
  'Saved',
  'Drafting',
  'Submitted',
  'Result Pending',
  'Won',
  'Rejected'
];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Saved:           'bg-slate-100 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50',
  Drafting:        'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50',
  Submitted:       'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50',
  'Result Pending':'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50',
  Won:             'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
  Rejected:        'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50',
};

const STATUS_HEADER_COLORS: Record<ApplicationStatus, string> = {
  Saved:           'text-slate-700 dark:text-slate-300',
  Drafting:        'text-blue-700 dark:text-blue-400',
  Submitted:       'text-indigo-700 dark:text-indigo-400',
  'Result Pending':'text-yellow-700 dark:text-yellow-400',
  Won:             'text-green-700 dark:text-green-400',
  Rejected:        'text-red-700 dark:text-red-400',
};

/** Inline note editor replaces the prompt() dialog */
function NoteEditor({ initialNote, onSave, onCancel }: { initialNote: string; onSave: (n: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(initialNote);
  return (
    <div className="mt-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-2 shadow-sm">
      <textarea
        autoFocus
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a note about your application..."
        className="w-full text-sm border-none outline-none resize-none text-gray-700 dark:text-gray-200 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <div className="flex justify-end gap-2 mt-1">
        <button onClick={onCancel} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Cancel">
          <XIcon size={14} />
        </button>
        <button onClick={() => onSave(value)} className="p-1 text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400" aria-label="Save note">
          <CheckIcon size={14} />
        </button>
      </div>
    </div>
  );
}

export function Saved() {
  const [savedItems, setSavedItems] = useState<SavedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await getSavedScholarships();
      setSavedItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    if (!draggedItemId) return;
    const previousItems = [...savedItems];
    setSavedItems(prev => prev.map(item =>
      item.scholarship.id === draggedItemId ? { ...item, status: newStatus } : item
    ));
    try {
      await updateSavedStatus(draggedItemId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
      setSavedItems(previousItems);
    }
    setDraggedItemId(null);
  };

  const handleSaveNote = async (id: string, currentStatus: ApplicationStatus, note: string) => {
    const previousItems = [...savedItems];
    setSavedItems(prev => prev.map(item =>
      item.scholarship.id === id ? { ...item, notes: note } : item
    ));
    try {
      await updateSavedStatus(id, currentStatus, note);
    } catch (err) {
      setSavedItems(previousItems);
    }
    setEditingNoteId(null);
  };

  const getItemsByStatus = (status: ApplicationStatus) =>
    savedItems.filter(item => item.status === status);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-x-auto">
        <div className="min-w-max">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Application Tracker</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Drag and drop scholarships to track your application progress.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 max-w-4xl mx-auto">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No saved scholarships</h3>
              <p className="text-gray-500 dark:text-gray-400">Go to your dashboard to discover and save matches.</p>
            </div>
          ) : (
            <div className="flex gap-5 pb-8">
              {STATUSES.map(status => (
                <div
                  key={status}
                  className={`w-80 flex-shrink-0 flex flex-col rounded-xl p-4 border ${STATUS_COLORS[status]}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className={`font-bold uppercase tracking-wider text-sm ${STATUS_HEADER_COLORS[status]}`}>
                      {status}
                    </h3>
                    <span className="bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      {getItemsByStatus(status).length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 min-h-[150px]">
                    {getItemsByStatus(status).map(item => (
                      <div
                        key={item.scholarship.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.scholarship.id)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <ScholarshipCard
                          match={{ scholarship: item.scholarship, match_score: 100 }}
                          isSavedInitial={true}
                          onUpdate={fetchSaved}
                          savedNotes={item.notes}
                        />
                        {/* Inline note editor */}
                        {editingNoteId === item.scholarship.id ? (
                          <NoteEditor
                            initialNote={item.notes || ''}
                            onSave={(note) => handleSaveNote(item.scholarship.id, item.status, note)}
                            onCancel={() => setEditingNoteId(null)}
                          />
                        ) : (
                          <div className="mt-1 text-right">
                            <button
                              onClick={() => setEditingNoteId(item.scholarship.id)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center ml-auto transition-colors"
                            >
                              <PencilIcon size={11} className="mr-1" />
                              {item.notes ? 'Edit Note' : '+ Add Note'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {getItemsByStatus(status).length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-24 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
