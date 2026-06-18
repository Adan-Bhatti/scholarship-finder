import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepAcademic } from './StepAcademic';
import { StepDemographic } from './StepDemographic';
import { StepFinancial } from './StepFinancial';
import { StepExtracurriculars } from './StepExtracurriculars';
import { useProfile } from '../../hooks/useProfile';
import { ProfileCreate } from '../../types';

export function Wizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<ProfileCreate>>({});
  const { createProfile } = useProfile();
  const navigate = useNavigate();
  
  const updateData = (newData: any) => setData({ ...data, ...newData });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      await createProfile(data as ProfileCreate);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      
      {/* Progress Bar */}
      <div className="mb-8 relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              Step {step} of 4
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
          <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"></div>
        </div>
      </div>

      {step === 1 && <StepAcademic data={data} updateData={updateData} />}
      {step === 2 && <StepDemographic data={data} updateData={updateData} />}
      {step === 3 && <StepFinancial data={data} updateData={updateData} />}
      {step === 4 && <StepExtracurriculars data={data} updateData={updateData} />}

      <div className="mt-8 flex justify-between pt-4 border-t border-gray-100">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Back
        </button>
        
        {step < 4 ? (
          <button 
            onClick={nextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-md shadow-blue-200"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-md shadow-green-200"
          >
            Complete Profile
          </button>
        )}
      </div>
    </div>
  );
}
