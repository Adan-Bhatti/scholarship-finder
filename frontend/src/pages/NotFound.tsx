import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-6">
          <p className="text-9xl font-extrabold text-slate-900/5 dark:text-white/5 select-none absolute -translate-x-1/2 left-1/2 -top-4">404</p>
          <p className="text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 relative z-10">404</p>
        </div>
        <div className="text-5xl mb-4">🔭</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-3">Scholarship Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">
          This page seems to have wandered off. Let's get you back to discovering opportunities.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
