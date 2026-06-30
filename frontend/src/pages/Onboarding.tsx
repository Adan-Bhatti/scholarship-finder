import React from 'react';
import { Wizard } from '../components/ProfileWizard/Wizard';

export function Onboarding() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          Let's build your AI Profile
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          The more details you provide, the better our AI can match you with scholarships you're actually eligible for.
        </p>
      </div>
      
      <Wizard />
    </div>
  );
}
