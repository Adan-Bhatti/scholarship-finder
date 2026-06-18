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
        <h2 className="text-2xl font-bold text-gray-800">Extracurriculars & Goals</h2>
        <p className="text-gray-500">Add any activities or specific countries you want to study in.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Extracurricular Activities</label>
        <div className="flex mt-1">
          <input 
            type="text" 
            placeholder="e.g. Debate Team Captain"
            className="block w-full rounded-l-md border-gray-300 shadow-sm p-2 border"
            value={currentExtra}
            onChange={(e) => setCurrentExtra(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExtra()}
          />
          <button 
            type="button" 
            className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
            onClick={addExtra}
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data.extracurriculars || []).map((item: string, idx: number) => (
            <span key={idx} className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Target Destinations (Countries)</label>
        <div className="flex mt-1">
          <input 
            type="text" 
            placeholder="e.g. United Kingdom"
            className="block w-full rounded-l-md border-gray-300 shadow-sm p-2 border"
            value={currentTarget}
            onChange={(e) => setCurrentTarget(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTarget()}
          />
          <button 
            type="button" 
            className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
            onClick={addTarget}
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data.target_destinations || []).map((item: string, idx: number) => (
            <span key={idx} className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
