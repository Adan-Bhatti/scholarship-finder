import React from 'react';
import { HomeIcon, BookmarkIcon, UserIcon, LogOutIcon, SearchIcon, MoonIcon, SunIcon, ShieldIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="mr-3">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { theme, toggleTheme } = useStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50"
    >
      <div className="p-6 flex items-center">
        <img src="/logo.png" alt="ScholarshipAI Logo" className="w-10 h-10 mr-3 rounded-xl shadow-lg" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          ScholarshipAI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-8">
        <NavItem to="/dashboard" icon={<HomeIcon size={20} />} label="Dashboard" />
        <NavItem to="/explore" icon={<SearchIcon size={20} />} label="Explore" />
        <NavItem to="/saved" icon={<BookmarkIcon size={20} />} label="Tracker" />
        <NavItem to="/profile" icon={<UserIcon size={20} />} label="Profile" />
        <NavItem to="/admin" icon={<ShieldIcon size={20} />} label="Admin" />
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <SunIcon size={20} className="mr-3" /> : <MoonIcon size={20} className="mr-3" />}
          <span className="font-medium">Toggle Theme</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOutIcon size={20} className="mr-3" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
}
