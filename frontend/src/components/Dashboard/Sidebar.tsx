import React, { useState } from 'react';
import { HomeIcon, BookmarkIcon, UserIcon, LogOutIcon, SearchIcon, MoonIcon, SunIcon, ShieldIcon, ChevronRightIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`group flex items-center px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-blue-600 rounded-xl"
          initial={false}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <div className={`relative z-10 mr-3 transition-transform ${!isActive ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </div>
      <span className="relative z-10 font-medium text-sm">{label}</span>
      {isActive && (
        <ChevronRightIcon size={14} className="relative z-10 ml-auto opacity-70" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const { theme, toggleTheme } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }, 400);
  };

  // Get initials from stored email
  const email = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email || null;
    } catch { return null; }
  })();
  const initials = email ? email.slice(0, 2).toUpperCase() : 'AI';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800/50"
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-xl flex-shrink-0">
            🎓
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 leading-none">
              ScholarshipAI
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Find your opportunity</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 mt-5 overflow-y-auto">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-4 mb-2">Navigation</p>
          <NavItem to="/dashboard" icon={<HomeIcon size={18} />} label="Dashboard" />
          <NavItem to="/explore" icon={<SearchIcon size={18} />} label="Explore" />
          <NavItem to="/saved" icon={<BookmarkIcon size={18} />} label="Tracker" />
          <NavItem to="/profile" icon={<UserIcon size={18} />} label="Profile" />

          <div className="pt-3 mt-3 border-t border-slate-800/50">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-4 mb-2">System</p>
            <NavItem to="/admin" icon={<ShieldIcon size={18} />} label="Admin" />
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-slate-800/50 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all group"
          >
            {theme === 'dark'
              ? <SunIcon size={17} className="mr-3 group-hover:text-yellow-400 transition-colors" />
              : <MoonIcon size={17} className="mr-3 group-hover:text-indigo-400 transition-colors" />}
            <span className="font-medium text-sm">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`ml-auto w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow" />
            </div>
          </button>

          {/* User info + logout */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-800/80 transition-all group cursor-pointer" onClick={handleLogout}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs truncate group-hover:text-white transition-colors">{email || 'User'}</p>
            </div>
            <LogOutIcon size={14} className={`text-slate-600 group-hover:text-red-400 transition-all flex-shrink-0 ${loggingOut ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
