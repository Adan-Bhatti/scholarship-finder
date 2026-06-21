import React from 'react';

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
        <input 
          type="text" 
          placeholder="e.g. Computer Science"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.field_of_study || ''}
          onChange={(e) => updateData({ field_of_study: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">GPA (Out of 4.0)</label>
        <input 
          type="number" 
          step="0.01"
          placeholder="e.g. 3.8"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.gpa || ''}
          onChange={(e) => updateData({ gpa: parseFloat(e.target.value) || null })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
        <input 
          type="number" 
          placeholder="e.g. 2026"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.graduation_year || ''}
          onChange={(e) => updateData({ graduation_year: parseInt(e.target.value) || null })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Max Sources to Match (1 - 50)</label>
        <input 
          type="number" 
          min="1"
          max="50"
          placeholder="e.g. 5"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.max_sources !== undefined ? data.max_sources : 5}
          onChange={(e) => updateData({ max_sources: parseInt(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
}
