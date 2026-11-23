import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban, CheckSquare, AlertTriangle, TrendingUp, Target, Clock,
  ArrowRight, Activity, Zap, ChevronRight, Calendar, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { KPICard } from '../../components/ui/KPICard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, StatusBadge, RiskBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { dashboardApi, projectsApi, tasksApi } from '../../services/api';
import { formatDate } from '../../utils/design';

// Demo data fallback
const demoKPI = {
  total_projects: 12,
  active_projects: 7,
  completed_tasks: 284,
  delayed_tasks: 18,
  high_risk_tasks: 9,
  on_time_completion_rate: 87.3,
};

const demoProjects = [
  { id: '1', name: 'E-Commerce Platform Rebuild', completion_percentage: 72, deadline: '2026-12-01', risk_level: 'moderate', status: 'active', predicted_delay_days: 3 },
  { id: '2', name: 'Mobile Banking App v2', completion_percentage: 45, deadline: '2026-11-28', risk_level: 'high', status: 'active', predicted_delay_days: 7 },
  { id: '3', name: 'Data Warehouse Migration', completion_percentage: 91, deadline: '2026-11-15', risk_level: 'low', status: 'active', predicted_delay_days: 0 },
  { id: '4', name: 'CRM Integration Suite', completion_percentage: 28, deadline: '2026-12-20', risk_level: 'high', status: 'active', predicted_delay_days: 12 },
];

const demoTimeline = [
  { month: 'Jun', planned: 42, actual: 38 },
  { month: 'Jul', planned: 55, actual: 51 },
  { month: 'Aug', planned: 61, actual: 59 },
  { month: 'Sep', planned: 70, actual: 64 },
  { month: 'Oct', planned: 78, actual: 71 },
  { month: 'Nov', planned: 85, actual: 82 },
];

const demoRiskDist = [
  { name: 'Low Risk', value: 38, color: '#059669' },
  { name: 'Moderate', value: 31, color: '#D97706' },
  { name: 'High Risk', value: 21, color: '#EA580C' },
  { name: 'Critical', value: 10, color: '#DC2626' },
];

const demoAlerts = [
  { id: '1', task: 'API Rate Limiting Implementation', project: 'E-Commerce Platform', risk: 82, deadline: '2026-11-08' },
  { id: '2', task: 'Payment Gateway Integration', project: 'Mobile Banking App', risk: 76, deadline: '2026-11-10' },
  { id: '3', task: 'Database Index Optimization', project: 'Data Warehouse', risk: 61, deadline: '2026-11-12' },
];

const demoActivity = [
  { id: '1', type: 'prediction', text: 'AI predicted 4-day delay on Backend API Integration', time: '5m ago', color: '#DC2626' },
  { id: '2', type: 'status', text: 'Task "User Auth Module" moved to In Progress', time: '22m ago', color: '#0284C7' },
  { id: '3', type: 'create', text: 'New project "Analytics Dashboard" created', time: '1h ago', color: '#4F46E5' },
  { id: '4', type: 'complete', text: 'Task "Database Schema Design" completed', time: '2h ago', color: '#059669' },
  { id: '5', type: 'assign', text: 'Emily Chen assigned to "Frontend Architecture"', time: '3h ago', color: '#D97706' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl p-3.5 shadow-xl min-w-[150px]">
        <p className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
                {p.name}:
              </span>
              <span className="font-bold text-slate-900 font-metric">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const [kpi, setKpi] = useState(demoKPI);
  const [projects, setProjects] = useState(demoProjects);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      dashboardApi.kpi().then(r => setKpi(r.data)).catch(() => {}),
      projectsApi.list({ limit: 4 }).then(r => setProjects(r.data?.items || r.data || demoProjects)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Project Intelligence Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Realtime Models
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Dual-head neural delay forecasts & CPM schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/forecasting">
            <Button variant="outline" size="sm" icon={<TrendingUp size={15} />}>
              View Forecasts
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="sm" icon={<Zap size={15} />}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Projects"
          value={kpi.total_projects}
          icon={<FolderKanban size={19} />}
          color="primary"
          index={0}
          trend={{ value: 8, label: 'vs last month' }}
        />
        <KPICard
          title="Active Projects"
          value={kpi.active_projects}
          icon={<Activity size={19} />}
          color="secondary"
          index={1}
          subtitle="In flight sprints"
        />
        <KPICard
          title="Completed Tasks"
          value={kpi.completed_tasks}
          icon={<CheckSquare size={19} />}
          color="success"
          index={2}
          trend={{ value: 12, label: 'this week' }}
        />
        <KPICard
          title="Delayed Tasks"
          value={kpi.delayed_tasks}
          icon={<Clock size={19} />}
          color="warning"
          index={3}
          trend={{ value: -5, label: 'vs last week' }}
        />
        <KPICard
          title="High Risk Tasks"
          value={kpi.high_risk_tasks}
          icon={<AlertTriangle size={19} />}
          color="danger"
          index={4}
          subtitle="Attention needed"
        />
        <KPICard
          title="On-Time Rate"
          value={`${kpi.on_time_completion_rate.toFixed(1)}%`}
          icon={<Target size={19} />}
          color="success"
          index={5}
          trend={{ value: 3.2, label: 'improvement' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart */}
        <Card className="lg:col-span-2" animate>
          <CardHeader
            title="Planned vs Actual Delivery Velocity"
            subtitle="Historical monthly task throughput & model calibration"
            icon={<Activity size={18} />}
          />
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={demoTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="plannedLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="actualLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="planned" stroke="#4F46E5" strokeWidth={2.5} fill="url(#plannedLight)" name="Planned Velocity" />
              <Area type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2.5} fill="url(#actualLight)" name="Actual Delivered" />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: 10 }}
                iconType="circle"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Distribution Donut */}
        <Card animate>
          <CardHeader
            title="Portfolio Risk Profile"
            subtitle="Monte Carlo & LSTM classified levels"
            icon={<AlertTriangle size={18} />}
          />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={demoRiskDist}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {demoRiskDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-md">
                      <span className="font-bold" style={{ color: payload[0].payload.color }}>
                        {payload[0].name}: {payload[0].value}%
                      </span>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
            {demoRiskDist.map((r) => (
              <div key={r.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-[11px] font-medium text-slate-600 truncate">{r.name}</span>
                </div>
                <span className="text-xs font-bold font-metric ml-2" style={{ color: r.color }}>{r.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Projects + Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <Card animate>
          <CardHeader
            title="Active Workstreams"
            subtitle="Real-time delivery progress"
            action={<Link to="/projects"><Button variant="ghost" size="sm" className="text-xs">All <ChevronRight size={14} /></Button></Link>}
          />
          <div className="space-y-4">
            {projects.map((p) => {
              const riskColor = { low: '#059669', moderate: '#D97706', high: '#EA580C', critical: '#DC2626' }[p.risk_level || 'low'];
              return (
                <Link
                  to={`/projects/${p.id}`}
                  key={p.id}
                  className="block p-3 rounded-xl bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {p.name}
                    </span>
                    <span className="text-xs font-bold font-metric text-slate-700 ml-2">
                      {p.completion_percentage}%
                    </span>
                  </div>
                  <ProgressBar
                    value={p.completion_percentage}
                    color={p.risk_level === 'low' ? 'success' : p.risk_level === 'moderate' ? 'warning' : 'danger'}
                    size="sm"
                  />
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-slate-500">Due {formatDate(p.deadline)}</span>
                    {(p.predicted_delay_days || 0) > 0 ? (
                      <span className="font-semibold flex items-center gap-1" style={{ color: riskColor }}>
                        <Clock size={11} /> +{p.predicted_delay_days}d delay risk
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium">On Schedule</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Risk Alerts */}
        <Card animate>
          <CardHeader
            title="High-Priority Signals"
            subtitle="Anomalies detected by model"
            icon={<AlertTriangle size={18} />}
            action={<Link to="/risk"><Button variant="ghost" size="sm" className="text-xs"><ChevronRight size={14} /></Button></Link>}
          />
          <div className="space-y-3">
            {demoAlerts.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all duration-200 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">{a.task}</span>
                  <span className="text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-metric flex-shrink-0">
                    {a.risk}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span>{a.project}</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(a.deadline)}
                  </div>
                </div>
                <ProgressBar value={a.risk} color="danger" size="sm" />
              </motion.div>
            ))}
          </div>
          <Link to="/forecasting" className="mt-4 block">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View All Predictions <ArrowRight size={13} />
            </Button>
          </Link>
        </Card>

        {/* Recent Activity */}
        <Card animate>
          <CardHeader
            title="Neural Audit Trail"
            subtitle="Live event timeline"
            icon={<Activity size={18} />}
          />
          <div className="space-y-4">
            {demoActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: a.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{a.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Project Completion Forecast Section */}
      <Card animate>
        <CardHeader
          title="Predictive Schedule Calibrations"
          subtitle="LSTM dual-head delay forecast vs planned milestones"
          icon={<TrendingUp size={18} />}
          action={<Link to="/forecasting"><Button variant="ghost" size="sm">Full Forecast <ChevronRight size={14} /></Button></Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { project: 'E-Commerce Platform', planned: '2026-12-01', predicted: '2026-12-04', delay: 3, confidence: 81, risk: 'moderate' },
            { project: 'Mobile Banking App', planned: '2026-11-28', predicted: '2026-12-05', delay: 7, confidence: 74, risk: 'high' },
            { project: 'Data Warehouse', planned: '2026-11-15', predicted: '2026-11-15', delay: 0, confidence: 93, risk: 'low' },
            { project: 'CRM Integration', planned: '2026-12-20', predicted: '2027-01-01', delay: 12, confidence: 68, risk: 'high' },
          ].map((f) => {
            const riskColor = { low: '#059669', moderate: '#D97706', high: '#EA580C', critical: '#DC2626' }[f.risk];
            return (
              <div
                key={f.project}
                className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="font-heading text-sm font-bold text-slate-900 mb-3 truncate flex items-center justify-between">
                    <span>{f.project}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ backgroundColor: `${riskColor}15`, color: riskColor }}
                    >
                      {f.risk}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Date</span>
                      <span className="text-slate-800 font-semibold">{formatDate(f.planned)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AI Estimate</span>
                      <span style={{ color: riskColor }} className="font-bold">{formatDate(f.predicted)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Milestone Delta</span>
                      <span style={{ color: riskColor }} className="font-bold font-metric">
                        {f.delay > 0 ? `+${f.delay} days` : 'On Schedule'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
                      <span className="text-slate-500">Model Confidence</span>
                      <span className="text-emerald-700 font-bold font-metric">{f.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3.5">
                  <ProgressBar
                    value={f.confidence}
                    color={f.risk === 'low' ? 'success' : f.risk === 'moderate' ? 'warning' : 'danger'}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
