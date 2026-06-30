import React from 'react';
import { COUNTRIES } from '../../utils/constants';

interface StepDemographicProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepDemographic({ data, updateData }: StepDemographicProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-display">Demographic Information</h2>
      <p className="text-gray-500 dark:text-slate-400">This helps match you with specific diversity or regional scholarships.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nationality</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          value={data.nationality || ''}
          onChange={(e) => updateData({ nationality: e.target.value })}
        >
          <option value="">Select Nationality</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Country of Residence</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          value={data.country_of_residence || ''}
          onChange={(e) => updateData({ country_of_residence: e.target.value })}
        >
          <option value="">Select Country</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Gender (Optional)</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Disability Status (Optional)</label>
        <input 
          type="text" 
          placeholder="e.g. None"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm p-2 border bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={data.disability || ''}
          onChange={(e) => updateData({ disability: e.target.value })}
        />
      </div>
    </div>
  );
}
