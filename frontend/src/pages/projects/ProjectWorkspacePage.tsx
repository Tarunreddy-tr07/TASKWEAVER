import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid, GanttChart, GitBranch, AlertTriangle, Users, Brain } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, StatusBadge, PriorityBadge, RiskBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/design';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'tasks', label: 'Task Board', icon: GanttChart },
  { key: 'gantt', label: 'Timeline', icon: GanttChart },
  { key: 'dependencies', label: 'Dependencies', icon: GitBranch },
  { key: 'risk', label: 'Risk Summary', icon: AlertTriangle },
  { key: 'ai', label: 'AI Predictions', icon: Brain },
];

// Demo project details
const demoProject = {
  id: '1', name: 'E-Commerce Platform Rebuild',
  description: 'Complete redesign of the customer-facing e-commerce platform with modern tech stack.',
  status: 'active', priority: 'high', manager_name: 'Alice Johnson',
  start_date: '2026-09-01', deadline: '2026-12-01',
  completion_percentage: 72, total_tasks: 48, completed_tasks: 35, delayed_tasks: 4,
  predicted_completion_date: '2026-12-04', predicted_delay_days: 3, risk_level: 'moderate',
  category: 'Web Development',
};

const demoTasks = [
  { id: 't1', name: 'User Authentication Module', status: 'completed', priority: 'high', assigned_name: 'Emily Chen', deadline: '2026-10-15', completion_percentage: 100, delay_probability: 0.08 },
  { id: 't2', name: 'Product Catalog API', status: 'in_progress', priority: 'high', assigned_name: 'James Lee', deadline: '2026-11-10', completion_percentage: 65, delay_probability: 0.42 },
  { id: 't3', name: 'Payment Gateway Integration', status: 'blocked', priority: 'critical', assigned_name: 'Sarah Kim', deadline: '2026-11-20', completion_percentage: 30, delay_probability: 0.78 },
  { id: 't4', name: 'Shopping Cart Service', status: 'in_progress', priority: 'medium', assigned_name: 'Tom Parker', deadline: '2026-11-25', completion_percentage: 50, delay_probability: 0.31 },
  { id: 't5', name: 'Search & Filtering Engine', status: 'not_started', priority: 'medium', assigned_name: 'Emily Chen', deadline: '2026-12-01', completion_percentage: 0, delay_probability: 0.55 },
  { id: 't6', name: 'Admin Dashboard', status: 'not_started', priority: 'low', assigned_name: 'James Lee', deadline: '2026-12-01', completion_percentage: 0, delay_probability: 0.22 },
];

const statusGroups = ['not_started', 'in_progress', 'blocked', 'completed'] as const;
const statusLabels: Record<string, string> = { not_started: 'Not Started', in_progress: 'In Progress', blocked: 'Blocked', completed: 'Completed' };

export function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const riskColor = { low: '#20C997', moderate: '#FFB84D', high: '#FF8C42', critical: '#FF5C75' }[demoProject.risk_level];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: demoProject.total_tasks, color: '#4F46E5' },
          { label: 'Completed', value: demoProject.completed_tasks, color: '#10B981' },
          { label: 'Delayed', value: demoProject.delayed_tasks, color: '#F59E0B' },
          { label: 'Progress', value: `${demoProject.completion_percentage}%`, color: '#0284C7' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Task Status Distribution" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusGroups.map(s => ({
              name: statusLabels[s],
              count: demoTasks.filter(t => t.status === s).length,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#0F172A' }} />
              <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="AI Completion Forecast" icon={<Brain size={16} />} />
          <div className="space-y-3">
            {[
              { label: 'Planned Completion', value: formatDate(demoProject.deadline), color: '#64748B' },
              { label: 'AI Predicted Completion', value: formatDate(demoProject.predicted_completion_date!), color: riskColor },
              { label: 'Potential Delay', value: `+${demoProject.predicted_delay_days} days`, color: riskColor },
              { label: 'Risk Level', value: demoProject.risk_level.toUpperCase(), color: riskColor },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className="text-sm font-semibold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
            <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-900 font-medium">🧠 Payment Gateway Integration is the primary delay driver. It is on the critical path and has 78% delay probability.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTaskBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-64">
      {statusGroups.map((status) => {
        const statusTasks = demoTasks.filter(t => t.status === status);
        const headerColor = { not_started: '#64748B', in_progress: '#0284C7', blocked: '#EF4444', completed: '#10B981' }[status];
        return (
          <div key={status} className="bg-slate-50/80 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>{statusLabels[status]}</span>
              <span className="w-5 h-5 rounded-full bg-slate-200/80 flex items-center justify-center text-xs font-semibold text-slate-600">{statusTasks.length}</span>
            </div>
            <div className="space-y-3">
              {statusTasks.map(task => {
                const rColor = task.delay_probability > 0.75 ? '#EF4444' : task.delay_probability > 0.5 ? '#F59E0B' : '#10B981';
                return (
                  <div key={task.id} className="bg-white rounded-xl p-3 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all cursor-pointer">
                    <p className="text-xs font-semibold text-slate-900 mb-2 leading-tight">{task.name}</p>
                    <div className="flex items-center justify-between mb-2">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[10px] font-bold" style={{ color: rColor }}>{(task.delay_probability * 100).toFixed(0)}% risk</span>
                    </div>
                    <ProgressBar value={task.completion_percentage} size="sm" color={task.delay_probability > 0.5 ? 'danger' : 'primary'} />
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-medium">
                      <span>{task.assigned_name}</span>
                      <span>{formatDate(task.deadline)}</span>
                    </div>
                  </div>
                );
              })}
              {statusTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'tasks': return renderTaskBoard();
      case 'gantt': return (
        <Card>
          <CardHeader title="Gantt Timeline" subtitle="Task schedule visualization" />
          <div className="space-y-3 mt-2">
            {demoTasks.map((task, i) => {
              const startOffset = i * 3;
              const width = task.completion_percentage || 10;
              return (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="w-48 text-xs text-slate-600 truncate flex-shrink-0 font-medium">{task.name}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden border border-slate-200/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 flex items-center px-2"
                      style={{ width: `${Math.max(width, 8)}%`, marginLeft: `${startOffset}%` }}
                    >
                      <span className="text-[9px] text-white font-medium truncate">{task.completion_percentage}%</span>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              );
            })}
          </div>
        </Card>
      );
      case 'dependencies': return (
        <Card>
          <CardHeader title="Dependency Graph" subtitle="Task relationships" icon={<GitBranch size={16} />} />
          <div className="py-8 text-center">
            <GitBranch size={40} className="text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 text-sm">View the full interactive dependency graph</p>
            <Link to="/dependencies" className="mt-4 inline-block">
              <Button variant="primary">Open Dependency Intelligence</Button>
            </Link>
          </div>
        </Card>
      );
      case 'risk': return (
        <Card>
          <CardHeader title="Risk Summary" icon={<AlertTriangle size={16} />} />
          <div className="space-y-3">
            {demoTasks.map(task => {
              const rColor = task.delay_probability > 0.75 ? '#EF4444' : task.delay_probability > 0.5 ? '#F59E0B' : task.delay_probability > 0.25 ? '#0284C7' : '#10B981';
              return (
                <div key={task.id} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{task.name}</p>
                    <p className="text-xs text-slate-500">{task.assigned_name}</p>
                  </div>
                  <div className="w-32">
                    <ProgressBar value={task.delay_probability * 100} color={task.delay_probability > 0.5 ? 'danger' : 'secondary'} size="sm" />
                  </div>
                  <span className="text-sm font-bold w-12 text-right" style={{ color: rColor }}>{(task.delay_probability * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      );
      case 'ai': return (
        <div className="space-y-4">
          {demoTasks.filter(t => t.delay_probability > 0.3).map(task => {
            const rColor = task.delay_probability > 0.75 ? '#EF4444' : task.delay_probability > 0.5 ? '#F59E0B' : '#0284C7';
            return (
              <Card key={task.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-1">{task.name}</p>
                    <p className="text-sm text-slate-500 mb-3">Assigned to {task.assigned_name} · Due {formatDate(task.deadline)}</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-lg font-bold" style={{ color: rColor }}>{(task.delay_probability * 100).toFixed(0)}%</div>
                        <div className="text-[10px] text-slate-500 font-medium">Delay Probability</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-lg font-bold text-sky-600">+{Math.round(task.delay_probability * 8)}d</div>
                        <div className="text-[10px] text-slate-500 font-medium">Expected Extra Days</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-lg font-bold text-emerald-600">{task.completion_percentage}%</div>
                        <div className="text-[10px] text-slate-500 font-medium">Completion</div>
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-xs text-indigo-900">🧠 AI Analysis: High workload on assigned employee + task complexity + {demoTasks.filter(t2 => t2.id !== task.id && t2.status !== 'completed').length} active prerequisites contribute to elevated delay risk.</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link to="/projects" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={15} />
          Projects
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-sm text-slate-900 font-semibold">{demoProject.name}</span>
      </div>

      {/* Project Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-slate-900">{demoProject.name}</h1>
              <StatusBadge status={demoProject.status} />
              <PriorityBadge priority={demoProject.priority} />
            </div>
            <p className="text-sm text-slate-600 mb-4">{demoProject.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Manager', value: demoProject.manager_name },
                { label: 'Category', value: demoProject.category },
                { label: 'Start', value: formatDate(demoProject.start_date) },
                { label: 'Deadline', value: formatDate(demoProject.deadline) },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-slate-500 mb-0.5">{s.label}</div>
                  <div className="font-semibold text-slate-900">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-48 flex-shrink-0">
            <div className="text-sm font-medium text-slate-600 mb-2">Overall Progress</div>
            <ProgressBar value={demoProject.completion_percentage} size="lg" showLabel color={demoProject.risk_level === 'low' ? 'success' : 'secondary'} />
            <div className="mt-2 text-xs font-semibold" style={{ color: riskColor }}>
              {(demoProject.predicted_delay_days || 0) > 0 ? `+${demoProject.predicted_delay_days}d delay predicted` : 'On track'}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto shadow-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}
