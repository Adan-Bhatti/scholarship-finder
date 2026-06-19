import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { ScholarshipCard } from '../components/Dashboard/ScholarshipCard';
import { getSavedScholarships, updateSavedStatus } from '../api/scholarships';
import type { SavedScholarship, ApplicationStatus } from '../types';

const STATUSES: ApplicationStatus[] = [
  'Saved',
  'Drafting',
  'Submitted',
  'Result Pending',
  'Won',
  'Rejected'
];

export function Saved() {
  const [savedItems, setSavedItems] = useState<SavedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchSaved();
  }, []);

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

    // Optimistic UI update
    const previousItems = [...savedItems];
    setSavedItems(prev => 
      prev.map(item => 
        item.scholarship.id === draggedItemId 
          ? { ...item, status: newStatus } 
          : item
      )
    );

    try {
      await updateSavedStatus(draggedItemId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert on failure
      setSavedItems(previousItems);
      alert('Failed to update status. Please try again.');
    }
    setDraggedItemId(null);
  };

  const getItemsByStatus = (status: ApplicationStatus) => {
    return savedItems.filter(item => item.status === status);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-x-auto">
        <div className="min-w-max">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Application Tracker</h2>
            <p className="text-gray-500 mt-2">Drag and drop scholarships to track your application progress.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No saved scholarships</h3>
              <p className="text-gray-500">Go to your dashboard to discover and save matches.</p>
            </div>
          ) : (
            <div className="flex gap-6 pb-8">
              {STATUSES.map(status => (
                <div 
                  key={status} 
                  className="w-80 flex-shrink-0 flex flex-col bg-gray-100/50 rounded-xl p-4 border border-gray-200"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm">{status}</h3>
                    <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
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
                      </div>
                    ))}
                    {getItemsByStatus(status).length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center text-gray-400 text-sm">
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
