import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Zap } from 'lucide-react';

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 animate-pulse shadow-xl shadow-indigo-500/25 flex items-center justify-center">
            <Zap size={26} className="text-white" />
          </div>
          <div className="text-slate-600 text-sm font-semibold tracking-wide">Loading TASKWEAVER...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex overflow-hidden relative">
      {/* Light Ambient Background Orbs & Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-indigo-100/60 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[650px] h-[450px] bg-purple-100/40 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      </div>

      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />

      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 relative z-10"
        style={{ marginLeft: sidebarCollapsed ? 68 : 248 }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            fontSize: '14px',
            boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.1)',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
        }}
      />
    </div>
  );
}
