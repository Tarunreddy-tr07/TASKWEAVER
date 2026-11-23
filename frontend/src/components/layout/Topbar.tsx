import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, LogOut, Settings, ChevronDown, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 flex items-center px-6 gap-4 relative z-30 shadow-sm">
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <div
          className={`flex items-center gap-2.5 bg-slate-100/80 border rounded-xl px-3.5 py-2 transition-all duration-300 ${
            searchFocused
              ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.12)] bg-white ring-2 ring-indigo-500/10'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, models, predictions..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none min-w-0"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* AI Assistant Quick Pill */}
        <Link
          to="/insights"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs transition-all cursor-pointer group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <Bot size={14} className="text-indigo-600 group-hover:scale-110 transition-transform" />
          <span>AI Copilot</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-none">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-500 capitalize mt-0.5">{user?.role || 'Engineer'}</div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Settings size={14} className="text-slate-400" />
                  Workspace Settings
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer mt-0.5"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
