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
  const [error, setError] = useState<string | null>(null);
  const { createProfile } = useProfile();
  const navigate = useNavigate();
  
  const updateData = (newData: any) => {
    setError(null);
    setData({ ...data, ...newData });
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!data.degree_level) {
        setError('Degree level is required.');
        return false;
      }
      if (data.gpa === undefined || data.gpa === null || isNaN(data.gpa)) {
        setError('GPA is required.');
        return false;
      }
      if (data.gpa < 0.0 || data.gpa > 4.0) {
        setError('GPA must be between 0.0 and 4.0.');
        return false;
      }
      if (!data.graduation_year) {
        setError('Graduation year is required.');
        return false;
      }
      if (data.graduation_year < 1900 || data.graduation_year > 2100) {
        setError('Graduation year must be between 1900 and 2100.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!data.nationality || !data.nationality.trim()) {
        setError('Nationality is required.');
        return false;
      }
      if (!data.country_of_residence || !data.country_of_residence.trim()) {
        setError('Country of residence is required.');
        return false;
      }
    }
    if (currentStep === 3) {
      // Income bracket is optional — no validation needed
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 4));
    }
  };
  const prevStep = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    try {
      await createProfile(data as ProfileCreate);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to save profile. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700/50">
      
      {/* Progress Bar */}
      <div className="mb-8 relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-200 dark:bg-indigo-900/30">
              Step {step} of 4
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100 dark:bg-slate-700">
          <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-300"></div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {step === 1 && <StepAcademic data={data} updateData={updateData} />}
      {step === 2 && <StepDemographic data={data} updateData={updateData} />}
      {step === 3 && <StepFinancial data={data} updateData={updateData} />}
      {step === 4 && <StepExtracurriculars data={data} updateData={updateData} />}

      <div className="mt-8 flex justify-between pt-4 border-t border-gray-100 dark:border-slate-700/50">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${step === 1 ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
        >
          Back
        </button>
        
        {step < 4 ? (
          <button 
            onClick={nextStep}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-md shadow-green-200 dark:shadow-none"
          >
            Complete Profile
          </button>
        )}
      </div>
    </div>
  );
}
