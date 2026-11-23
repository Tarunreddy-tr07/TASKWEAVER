import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectWorkspacePage } from './pages/projects/ProjectWorkspacePage';
import { TasksPage } from './pages/tasks/TasksPage';
import { DependencyIntelligencePage } from './pages/dependency/DependencyIntelligencePage';
import { DelayForecastingPage } from './pages/forecasting/DelayForecastingPage';
import { RiskAnalysisPage } from './pages/risk/RiskAnalysisPage';
import { WhatIfSimulatorPage } from './pages/simulator/WhatIfSimulatorPage';
import { WorkloadPage } from './pages/workload/WorkloadPage';
import { AIInsightsPage } from './pages/insights/AIInsightsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/dependencies" element={<DependencyIntelligencePage />} />
            <Route path="/forecasting" element={<DelayForecastingPage />} />
            <Route path="/risk" element={<RiskAnalysisPage />} />
            <Route path="/simulator" element={<WhatIfSimulatorPage />} />
            <Route path="/workload" element={<WorkloadPage />} />
            <Route path="/insights" element={<AIInsightsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
