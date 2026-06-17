import React from 'react';

interface StepDemographicProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepDemographic({ data, updateData }: StepDemographicProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Demographic Information</h2>
      <p className="text-gray-500">This helps match you with specific diversity or regional scholarships.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Nationality</label>
        <input 
          type="text" 
          placeholder="e.g. Pakistani"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.nationality || ''}
          onChange={(e) => updateData({ nationality: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Country of Residence</label>
        <input 
          type="text" 
          placeholder="e.g. United Arab Emirates"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.country_of_residence || ''}
          onChange={(e) => updateData({ country_of_residence: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gender (Optional)</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.gender || ''}
          onChange={(e) => updateData({ gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Disability Status (Optional)</label>
        <input 
          type="text" 
          placeholder="e.g. None"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.disability || ''}
          onChange={(e) => updateData({ disability: e.target.value })}
        />
      </div>
    </div>
  );
}
