import React, { useState } from 'react';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { PlayIcon, CheckCircleIcon, ShieldIcon, BarChart3Icon, SearchIcon, BotIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockAnalyticsData = [
  { name: 'Mon', scholarships: 120, users: 40 },
  { name: 'Tue', scholarships: 250, users: 55 },
  { name: 'Wed', scholarships: 400, users: 80 },
  { name: 'Thu', scholarships: 380, users: 95 },
  { name: 'Fri', scholarships: 510, users: 110 },
  { name: 'Sat', scholarships: 700, users: 140 },
  { name: 'Sun', scholarships: 890, users: 180 },
];

export function AdminDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isDynamicScraping, setIsDynamicScraping] = useState(false);

  const handleDiscoverSources = async () => {
    setIsDiscovering(true);
    try {
      await apiClient.post('/sources/discover');
      toast.success('Source discovery started in background!');
    } catch (err: any) {
      toast.error('Failed to start source discovery.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleDynamicScrape = async () => {
    setIsDynamicScraping(true);
    try {
      await apiClient.post('/sources/scrape');
      toast.success('Dynamic scraping started in background!');
    } catch (err: any) {
      toast.error('Failed to start dynamic scraping.');
    } finally {
      setIsDynamicScraping(false);
    }
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display flex items-center">
              <ShieldIcon className="mr-3 text-indigo-600 dark:text-indigo-400" size={32} />
              Admin Dashboard
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Manage backend tasks and data sources.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Web Scraper Control</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Trigger the Scrapy spiders to fetch new scholarships from configured sources (Fastweb, Scholarships.com, etc.). The scraper runs in the background and saves directly to the database.</p>
            
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

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-8 mt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Producer-Consumer AI Engine</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Discover new scholarship sources using DuckDuckGo (Producer), and dynamically extract scholarship details from unknown websites using Groq LLM (Consumer).</p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleDiscoverSources}
                disabled={isDiscovering}
                className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isDiscovering ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <SearchIcon size={20} className="mr-2" />
                )}
                {isDiscovering ? 'Discovering...' : 'Discover Sources'}
              </button>

              <button
                onClick={handleDynamicScrape}
                disabled={isDynamicScraping}
                className="flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isDynamicScraping ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <BotIcon size={20} className="mr-2" />
                )}
                {isDynamicScraping ? 'Scraping...' : 'Run Dynamic AI Scraper'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-8 mt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Email Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Manually trigger the deadline reminder job. This job normally runs daily at 8:00 AM via Celery beat.</p>
            
            <button
                onClick={async () => {
                  try {
                    await apiClient.post('/scraper/reminders');
                    toast.success('Reminders job started in background.');
                  } catch (err: any) {
                    toast.error('Failed to trigger reminders.');
                  }
                }}
                className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Trigger Deadline Reminders
            </button>
          </div>

          {/* New Analytics Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-8 mt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3Icon className="mr-2 text-indigo-600 dark:text-indigo-400" size={24} />
              System Growth Analytics
            </h3>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockAnalyticsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScholarships" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="scholarships" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScholarships)" name="Scholarships Scraped" />
                  <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
