import React from 'react';
import { FIELDS_OF_STUDY } from '../../utils/constants';

interface StepAcademicProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepAcademic({ data, updateData }: StepAcademicProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Academic Background</h2>
      <p className="text-gray-500">Tell us about your current studies.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Degree Level</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
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
        <label className="block text-sm font-medium text-gray-700">Field of Study</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white"
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
        <label className="block text-sm font-medium text-gray-700">GPA (Out of 4.0)</label>
        <input 
          type="number" 
          step="0.01"
          min="0"
          max="4"
          placeholder="e.g. 3.8"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.gpa || ''}
          onChange={(e) => updateData({ gpa: parseFloat(e.target.value) || null })}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
        <input 
          type="number" 
          min="1900"
          max="2100"
          placeholder="e.g. 2026"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.graduation_year || ''}
          onChange={(e) => updateData({ graduation_year: parseInt(e.target.value) || null })}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      </div>
    </div>
  );
}
