import React from 'react';
import { getIncomeBracketsForCountry } from '../../utils/incomeBrackets';

interface StepFinancialProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepFinancial({ data, updateData }: StepFinancialProps) {
  const brackets = getIncomeBracketsForCountry(data.country_of_residence);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Financial Information</h2>
      <p className="text-gray-500">Need-based scholarships require this information.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Family Income Bracket</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.income_bracket || ''}
          onChange={(e) => updateData({ income_bracket: e.target.value })}
        >
          <option value="">Select Bracket</option>
          {brackets.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
