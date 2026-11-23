import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, GitBranch, TrendingUp,
  AlertTriangle, Beaker, Users, BarChart3, Settings, ChevronLeft,
  ChevronRight, Zap, Brain
} from 'lucide-react';
import { cn } from '../../utils/design';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', group: 'main' },
  { path: '/projects', icon: FolderKanban, label: 'Projects', group: 'main' },
  { path: '/tasks', icon: CheckSquare, label: 'My Tasks', group: 'main' },
  { path: '/dependencies', icon: GitBranch, label: 'Dependency Intelligence', group: 'ai' },
  { path: '/forecasting', icon: TrendingUp, label: 'Delay Forecasting', group: 'ai' },
  { path: '/risk', icon: AlertTriangle, label: 'Risk Analysis', group: 'ai' },
  { path: '/simulator', icon: Beaker, label: 'What-If Simulator', group: 'ai' },
  { path: '/workload', icon: Users, label: 'Workload Analytics', group: 'ai' },
  { path: '/insights', icon: Brain, label: 'AI Insights', group: 'ai' },
  { path: '/reports', icon: BarChart3, label: 'Reports', group: 'general' },
  { path: '/settings', icon: Settings, label: 'Settings', group: 'general' },
];

const groups = [
  { key: 'main', label: 'Workspace' },
  { key: 'ai', label: 'AI Intelligence' },
  { key: 'general', label: 'General' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 248 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-2xl border-r border-slate-200/90 z-40 flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(15,23,42,0.03)]"
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200/80 flex-shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
            <Zap size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-heading font-extrabold text-slate-900 text-base tracking-tight whitespace-nowrap">
                  TASKWEAVER
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 -mt-0.5">
                  AI Intelligence
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-4">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.key);
          return (
            <div key={group.key} className="px-2">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const active = location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                        active
                          ? 'bg-indigo-50/80 text-indigo-700 font-semibold border-l-2 border-indigo-600 shadow-sm shadow-indigo-100'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          'flex-shrink-0 transition-colors',
                          active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-900'
                        )}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="whitespace-nowrap truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 flex-shrink-0 bg-slate-50/40">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
