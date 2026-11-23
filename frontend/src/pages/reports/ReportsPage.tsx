import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const monthlyData = [
  { month: 'Jun', planned: 42, actual: 38, delayed: 4 },
  { month: 'Jul', planned: 58, actual: 52, delayed: 6 },
  { month: 'Aug', planned: 65, actual: 61, delayed: 4 },
  { month: 'Sep', planned: 74, actual: 67, delayed: 7 },
  { month: 'Oct', planned: 80, actual: 72, delayed: 8 },
  { month: 'Nov', planned: 86, actual: 79, delayed: 7 },
];

const teamPerformance = [
  { name: 'Emily Chen', score: 94, tasks: 28, onTime: 26 },
  { name: 'James Lee', score: 87, tasks: 22, onTime: 19 },
  { name: 'Sarah Kim', score: 81, tasks: 31, onTime: 25 },
  { name: 'Tom Parker', score: 91, tasks: 18, onTime: 17 },
  { name: 'Carol Davis', score: 96, tasks: 24, onTime: 23 },
  { name: 'David Wilson', score: 89, tasks: 14, onTime: 13 },
];

const categoryData = [
  { cat: 'Web Dev', completed: 48, delayed: 6 },
  { cat: 'Mobile', delayed: 8, completed: 22 },
  { cat: 'Data Eng', completed: 29, delayed: 1 },
  { cat: 'Integration', completed: 15, delayed: 6 },
  { cat: 'Analytics', completed: 3, delayed: 0 },
];

const tooltipStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#0F172A' };

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Historical performance and prediction analytics</p>
        </div>
        <div className="flex gap-2">
          {['1m', '3m', '6m', '1y'].map(r => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${timeRange === r ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'}`}>
              {r}
            </button>
          ))}
          <Button variant="outline" size="sm" icon={<Download size={14} />}>Export</Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Task Completion Trend" subtitle="Planned vs Actual vs Delayed" icon={<TrendingUp size={16} />} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
              <Area type="monotone" dataKey="planned" name="Planned" stroke="#4F46E5" fill="url(#gPlanned)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#10B981" fill="url(#gActual)" strokeWidth={2} />
              <Line type="monotone" dataKey="delayed" name="Delayed" stroke="#EF4444" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Performance by Category" subtitle="Completion vs delay rate" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="cat" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
              <Bar dataKey="completed" name="Completed" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader title="Team Performance Report" subtitle="Individual contributor metrics" icon={<BarChart3 size={16} />} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Team Member', 'Performance Score', 'Tasks Completed', 'On-Time Rate', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 py-3 px-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamPerformance.sort((a, b) => b.score - a.score).map((emp, i) => {
                const onTimeRate = Math.round((emp.onTime / emp.tasks) * 100);
                const scoreColor = emp.score >= 90 ? '#10B981' : emp.score >= 80 ? '#0284C7' : '#F59E0B';
                return (
                  <motion.tr
                    key={emp.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {emp.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div className="h-full rounded-full" style={{ width: `${emp.score}%`, background: scoreColor }} />
                          </div>
                        </div>
                        <span className="font-bold text-sm" style={{ color: scoreColor }}>{emp.score}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{emp.tasks}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${onTimeRate >= 90 ? 'text-emerald-600' : onTimeRate >= 80 ? 'text-sky-600' : 'text-amber-600'}`}>
                        {onTimeRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.score >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {emp.score >= 90 ? 'Top Performer' : 'On Track'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
