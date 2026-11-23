import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, RiskBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Progress';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

const projectRisks = [
  {
    id: '1', name: 'E-Commerce Platform', risk_score: 62, risk_level: 'high',
    factors: { schedule_risk: 72, resource_risk: 58, dependency_risk: 80, scope_risk: 45, technical_risk: 55 },
    delayed_tasks: 4, blocked_tasks: 1, critical_path_risk: 'high',
    mitigation: 'Reassign 2 overloaded developers. Resolve Payment Gateway blocking issue by Nov 10.',
  },
  {
    id: '2', name: 'Mobile Banking App v2', risk_score: 74, risk_level: 'critical',
    factors: { schedule_risk: 85, resource_risk: 70, dependency_risk: 65, scope_risk: 60, technical_risk: 78 },
    delayed_tasks: 8, blocked_tasks: 3, critical_path_risk: 'critical',
    mitigation: 'Project is severely behind schedule. Recommend scope reduction or deadline extension.',
  },
  {
    id: '3', name: 'Data Warehouse Migration', risk_score: 18, risk_level: 'low',
    factors: { schedule_risk: 15, resource_risk: 20, dependency_risk: 12, scope_risk: 22, technical_risk: 21 },
    delayed_tasks: 1, blocked_tasks: 0, critical_path_risk: 'low',
    mitigation: 'Project is on track. Continue monitoring data quality validation tasks.',
  },
  {
    id: '4', name: 'CRM Integration Suite', risk_score: 78, risk_level: 'critical',
    factors: { schedule_risk: 80, resource_risk: 65, dependency_risk: 90, scope_risk: 70, technical_risk: 85 },
    delayed_tasks: 6, blocked_tasks: 2, critical_path_risk: 'critical',
    mitigation: 'Dependency on external Salesforce API causing cascading delays. Escalate to vendor.',
  },
];

export function RiskAnalysisPage() {
  const [selected, setSelected] = React.useState(projectRisks[0]);
  const radarData = Object.entries(selected.factors).map(([key, val]) => ({
    subject: key.replace('_risk', '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: val,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Risk Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive risk scoring across all active projects</p>
      </div>

      {/* Project Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {projectRisks.map((p, i) => {
          const rColor = { low: '#10B981', moderate: '#F59E0B', high: '#F97316', critical: '#EF4444' }[p.risk_level];
          const isSelected = selected.id === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(p)}
              className={`bg-white border-2 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 ${
                isSelected ? 'border-indigo-600 shadow-md shadow-indigo-500/10' : 'border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <RiskBadge level={p.risk_level} />
                <div className="text-2xl font-black" style={{ color: rColor }}>{p.risk_score}</div>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-3 leading-tight">{p.name}</p>
              <ProgressBar value={p.risk_score} color={p.risk_level === 'low' ? 'success' : p.risk_level === 'moderate' ? 'secondary' : 'danger'} size="sm" />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium">
                <div><span className="text-slate-500">Delayed: </span><span className="text-amber-600 font-semibold">{p.delayed_tasks}</span></div>
                <div><span className="text-slate-500">Blocked: </span><span className="text-rose-600 font-semibold">{p.blocked_tasks}</span></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title={`${selected.name} — Risk Radar`} icon={<Shield size={16} />} />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
              <Radar name="Risk" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Risk Factor Breakdown" icon={<Activity size={16} />} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={radarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
              <YAxis type="category" dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} width={100} axisLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#0F172A' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {radarData.map((entry, i) => (
                  <Cell key={i} fill={entry.value > 70 ? '#EF4444' : entry.value > 50 ? '#F59E0B' : '#4F46E5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-900 mb-1">💡 Mitigation Recommendation</p>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{selected.mitigation}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
