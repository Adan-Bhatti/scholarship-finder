import React, { useState } from 'react';

interface StepExtracurricularsProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepExtracurriculars({ data, updateData }: StepExtracurricularsProps) {
  const [currentExtra, setCurrentExtra] = useState('');
  const [currentTarget, setCurrentTarget] = useState('');

  const addExtra = () => {
    if (!currentExtra.trim()) return;
    const extras = data.extracurriculars || [];
    updateData({ extracurriculars: [...extras, currentExtra.trim()] });
    setCurrentExtra('');
  };

  const addTarget = () => {
    if (!currentTarget.trim()) return;
    const targets = data.target_destinations || [];
    updateData({ target_destinations: [...targets, currentTarget.trim()] });
    setCurrentTarget('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-display">Extracurriculars & Goals</h2>
        <p className="text-gray-500 dark:text-slate-400">Add any activities or specific countries you want to study in.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Extracurricular Activities</label>
        <div className="flex mt-1">
          <input 
            type="text" 
            placeholder="e.g. Debate Team Captain"
            className="block w-full rounded-l-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={currentExtra}
            onChange={(e) => setCurrentExtra(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExtra()}
          />
          <button 
            type="button" 
            className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700 transition-colors"
            onClick={addExtra}
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data.extracurriculars || []).map((item: string, idx: number) => (
            <span key={idx} className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm px-3 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Target Destinations (Countries)</label>
        <div className="flex mt-1">
          <input 
            type="text" 
            placeholder="e.g. United Kingdom"
            className="block w-full rounded-l-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={currentTarget}
            onChange={(e) => setCurrentTarget(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTarget()}
          />
          <button 
            type="button" 
            className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700 transition-colors"
            onClick={addTarget}
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data.target_destinations || []).map((item: string, idx: number) => (
            <span key={idx} className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm px-3 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
