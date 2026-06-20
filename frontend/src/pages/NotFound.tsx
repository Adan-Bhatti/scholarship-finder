import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-blue-600 mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Sorry, we couldn't find the page you were looking for. It might have been moved or deleted.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
