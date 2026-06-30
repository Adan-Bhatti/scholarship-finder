import React from 'react';
import { FIELDS_OF_STUDY } from '../../utils/constants';

interface StepAcademicProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepAcademic({ data, updateData }: StepAcademicProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-display">Academic Background</h2>
      <p className="text-gray-500 dark:text-slate-400">Tell us about your current studies.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Degree Level</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          value={data.degree_level || ''}
          onChange={(e) => updateData({ degree_level: e.target.value })}
        >
          <option value="">Select Level</option>
          <option value="High School">High School</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Master's">Master's</option>
          <option value="PhD">PhD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Field of Study</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          value={data.field_of_study || ''}
          onChange={(e) => updateData({ field_of_study: e.target.value })}
        >
          <option value="">Select Field</option>
          {FIELDS_OF_STUDY.map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">GPA (Out of 4.0)</label>
        <input 
          type="number" 
          step="0.01"
          min="0"
          max="4"
          placeholder="e.g. 3.8"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={data.gpa || ''}
          onChange={(e) => updateData({ gpa: parseFloat(e.target.value) || null })}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Graduation Year</label>
        <input 
          type="number" 
          min="1900"
          max="2100"
          placeholder="e.g. 2026"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={data.graduation_year || ''}
          onChange={(e) => updateData({ graduation_year: parseInt(e.target.value) || null })}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>
    </div>
  );
}
