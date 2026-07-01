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
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-white'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-indigo-600 rounded-xl"
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
    <>
      {/* Desktop Sidebar */}
      <AnimatePresence>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-64 h-screen bg-white dark:bg-slate-900 flex-col fixed left-0 top-0 z-50 border-r border-slate-200 dark:border-slate-800/50 hidden md:flex"
        >
          {/* Logo */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-xl flex-shrink-0">
              🎓
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white font-display leading-none">
                ScholarshipAI
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Find your opportunity</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1 mt-5 overflow-y-auto">
            <p className="text-slate-500 dark:text-slate-600 text-xs font-semibold uppercase tracking-wider px-4 mb-2">Navigation</p>
            <NavItem to="/dashboard" icon={<HomeIcon size={18} />} label="Dashboard" />
            <NavItem to="/explore" icon={<SearchIcon size={18} />} label="Explore" />
            <NavItem to="/saved" icon={<BookmarkIcon size={18} />} label="Tracker" />
            <NavItem to="/profile" icon={<UserIcon size={18} />} label="Profile" />

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/50">
              <p className="text-slate-500 dark:text-slate-600 text-xs font-semibold uppercase tracking-wider px-4 mb-2">System</p>
              <NavItem to="/admin" icon={<ShieldIcon size={18} />} label="Admin" />
            </div>
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/50 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all group"
            >
              {theme === 'dark'
                ? <SunIcon size={17} className="mr-3 group-hover:text-yellow-400 transition-colors" />
                : <MoonIcon size={17} className="mr-3 group-hover:text-indigo-600 transition-colors" />}
              <span className="font-medium text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
              <div className={`ml-auto w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${theme === 'dark' ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                <div className="w-3 h-3 rounded-full bg-white shadow" />
              </div>
            </button>

            {/* User info + logout */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group cursor-pointer" onClick={handleLogout}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 dark:text-slate-400 text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{email || 'User'}</p>
              </div>
              <LogOutIcon size={14} className={`text-slate-400 dark:text-slate-600 group-hover:text-red-500 dark:group-hover:text-red-400 transition-all flex-shrink-0 ${loggingOut ? 'animate-spin' : ''}`} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <Link to="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center gap-1">
          <HomeIcon size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/explore" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center gap-1">
          <SearchIcon size={20} />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>
        <Link to="/saved" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center gap-1">
          <BookmarkIcon size={20} />
          <span className="text-[10px] font-medium">Saved</span>
        </Link>
        <Link to="/profile" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center gap-1">
          <UserIcon size={20} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </>
  );
}
