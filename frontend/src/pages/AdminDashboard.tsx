import React, { useState } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { PlayIcon, CheckCircleIcon, ShieldIcon } from 'lucide-react';

export function AdminDashboard() {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunScraper = async () => {
    setIsRunning(true);
    try {
      await apiClient.post('/scraper/run');
      toast.success('Scraper started successfully in the background!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to start scraper.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShieldIcon className="mr-3 text-blue-600" size={32} />
              Admin Dashboard
            </h2>
            <p className="text-gray-500 mt-2">Manage backend tasks and data sources.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Web Scraper Control</h3>
            <p className="text-sm text-gray-500 mb-6">Trigger the Scrapy spiders to fetch new scholarships from configured sources (Fastweb, Scholarships.com, etc.). The scraper runs in the background and saves directly to the database.</p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRunScraper}
                disabled={isRunning}
                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isRunning ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <PlayIcon size={20} className="mr-2" />
                )}
                {isRunning ? 'Starting Scraper...' : 'Run Scraper Now'}
              </button>
              
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircleIcon size={16} className="text-green-500 mr-1" />
                Ready to scrape
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
