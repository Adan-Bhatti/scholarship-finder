import React from 'react';

interface StepFinancialProps {
  data: any;
  updateData: (data: any) => void;
}

export function StepFinancial({ data, updateData }: StepFinancialProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Financial Information</h2>
      <p className="text-gray-500">Need-based scholarships require this information.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Family Income Bracket (USD)</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={data.income_bracket || ''}
          onChange={(e) => updateData({ income_bracket: e.target.value })}
        >
          <option value="">Select Bracket</option>
          <option value="Under $30,000">Under $30,000</option>
          <option value="$30,000 - $60,000">$30,000 - $60,000</option>
          <option value="$60,000 - $100,000">$60,000 - $100,000</option>
          <option value="Over $100,000">Over $100,000</option>
        </select>
      </div>
    </div>
  );
}
