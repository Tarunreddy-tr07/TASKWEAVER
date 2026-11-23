import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, RiskBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDate, getRiskColor, getRiskLevel } from '../../utils/design';

const demoPredictions = [
  { id: 'p1', task_id: 't3', task_name: 'Payment Gateway Integration', project_name: 'E-Commerce Platform', assigned_name: 'James Lee', delay_probability: 0.82, predicted_duration: 14, estimated_duration: 10, confidence_score: 0.87, risk_level: 'critical' as const, deadline: '2026-11-20', extra_days: 4, explanation: 'High workload on assigned employee (87% utilization), task complexity is High, 2 blocking prerequisites not fully resolved, and historical team performance for payment integrations shows 74% delay rate.', feature_importance: { employee_workload: 0.34, task_complexity: 0.28, prerequisite_delays: 0.22, historical_performance: 0.16 } },
  { id: 'p2', task_id: 't5', task_name: 'CRM Data Mapping', project_name: 'CRM Integration Suite', assigned_name: 'Carol Davis', delay_probability: 0.65, predicted_duration: 12, estimated_duration: 8, confidence_score: 0.79, risk_level: 'high' as const, deadline: '2026-11-25', extra_days: 4, explanation: 'Task scope recently expanded with 40% more fields than initially estimated. Assigned employee has 3 concurrent high-priority tasks. Similar past tasks averaged 152% of estimated duration.', feature_importance: { scope_changes: 0.31, concurrent_tasks: 0.27, historical_overruns: 0.24, task_complexity: 0.18 } },
  { id: 'p3', task_id: 't5b', task_name: 'API Rate Limiting', project_name: 'E-Commerce Platform', assigned_name: 'Sarah Kim', delay_probability: 0.78, predicted_duration: 7, estimated_duration: 5, confidence_score: 0.83, risk_level: 'critical' as const, deadline: '2026-11-08', extra_days: 2, explanation: 'Critical deadline with insufficient time buffer. Employee workload at 91%. This task is on the critical path — any delay directly impacts project completion.', feature_importance: { deadline_buffer: 0.38, employee_workload: 0.29, critical_path: 0.21, dependency_count: 0.12 } },
  { id: 'p4', task_id: 't4', task_name: 'Database Index Optimization', project_name: 'Data Warehouse Migration', assigned_name: 'Tom Parker', delay_probability: 0.35, predicted_duration: 4, estimated_duration: 3, confidence_score: 0.72, risk_level: 'moderate' as const, deadline: '2026-11-12', extra_days: 1, explanation: 'Moderate risk due to dependency on data profiling completion. Employee performance history is strong (92nd percentile). Scope is well-defined but technical unknowns remain.', feature_importance: { dependency_status: 0.32, technical_uncertainty: 0.28, employee_performance: 0.24, scope_clarity: 0.16 } },
  { id: 'p5', task_id: 't6', task_name: 'Mobile Push Notifications', project_name: 'Mobile Banking App', assigned_name: 'Emily Chen', delay_probability: 0.18, predicted_duration: 5, estimated_duration: 5, confidence_score: 0.88, risk_level: 'low' as const, deadline: '2026-11-15', extra_days: 0, explanation: 'Low risk. Task is 55% complete, well within schedule. Employee has strong performance record for similar integrations. No blocking dependencies detected.', feature_importance: { current_progress: 0.36, employee_track_record: 0.31, dependency_clear: 0.21, scope_clarity: 0.12 } },
];

const riskThresholds = { low: 25, moderate: 50, high: 75, critical: 100 };

function PredictionCard({ pred, index }: { pred: typeof demoPredictions[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const rColor = getRiskColor(pred.delay_probability);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all"
      style={{ borderLeftColor: rColor, borderLeftWidth: 4 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5 truncate">{pred.task_name}</h3>
            <p className="text-xs text-slate-500">{pred.project_name} · {pred.assigned_name}</p>
          </div>
          <RiskBadge level={pred.risk_level} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-2xl font-bold mb-0.5" style={{ color: rColor }}>
              {(pred.delay_probability * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Delay Probability</div>
          </div>
          <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-2xl font-bold text-sky-600 mb-0.5">{pred.predicted_duration}d</div>
            <div className="text-[10px] text-slate-500 font-medium">Predicted Duration</div>
          </div>
          <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-2xl font-bold mb-0.5" style={{ color: pred.extra_days > 0 ? rColor : '#10B981' }}>
              {pred.extra_days > 0 ? `+${pred.extra_days}d` : 'On Time'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Extra Days</div>
          </div>
          <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600 mb-0.5">{(pred.confidence_score * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500 font-medium">Confidence</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-600">Delay Probability</span>
            <span style={{ color: rColor }}>{(pred.delay_probability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pred.delay_probability * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
              className="h-full rounded-full"
              style={{ background: rColor }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>LOW (0-25%)</span><span>MOD (26-50%)</span><span>HIGH (51-75%)</span><span>CRIT (76-100%)</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors mt-2"
        >
          <span>AI Explanation & Feature Importance</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-slate-200 p-5 bg-slate-50/70"
        >
          <div className="flex items-start gap-2 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <Brain size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-950 leading-relaxed font-medium">{pred.explanation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-3">Feature Importance</p>
            <div className="space-y-2">
              {Object.entries(pred.feature_importance).sort(([,a],[,b]) => b - a).map(([feat, importance]) => (
                <div key={feat}>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-600 capitalize">{feat.replace(/_/g, ' ')}</span>
                    <span className="text-indigo-600 font-semibold">{(importance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${importance * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function DelayForecastingPage() {
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [runningBatch, setRunningBatch] = useState(false);

  const filtered = demoPredictions.filter(p => {
    const matchRisk = filterRisk === 'all' || p.risk_level === filterRisk;
    const matchProject = filterProject === 'all' || p.project_name.includes(filterProject);
    return matchRisk && matchProject;
  });

  const riskCounts = demoPredictions.reduce((acc, p) => {
    acc[p.risk_level] = (acc[p.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleBatchPredict = async () => {
    setRunningBatch(true);
    await new Promise(r => setTimeout(r, 2000));
    setRunningBatch(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Delay Forecasting</h1>
          <p className="text-sm text-slate-500 mt-1">LSTM-based predictions for {demoPredictions.length} tasks across all projects</p>
        </div>
        <Button icon={<Brain size={16} />} loading={runningBatch} onClick={handleBatchPredict}>
          Run Batch Prediction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Risk', count: riskCounts.critical || 0, color: '#EF4444', bg: 'bg-rose-50', border: 'border-rose-200' },
          { label: 'High Risk', count: riskCounts.high || 0, color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Moderate Risk', count: riskCounts.moderate || 0, color: '#0284C7', bg: 'bg-sky-50', border: 'border-sky-200' },
          { label: 'Low Risk', count: riskCounts.low || 0, color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`${s.bg} border ${s.border} rounded-xl p-4 shadow-xs`}>
            <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.count}</div>
            <div className="text-sm text-slate-600 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Thresholds info */}
      <div className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-xl">
        <Info size={15} className="text-sky-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-700">
          <span className="text-sky-800 font-bold">Risk thresholds: </span>
          LOW 0–25% · MODERATE 26–50% · HIGH 51–75% · CRITICAL 76–100%.
          These are configurable in Settings. Confidence score reflects model certainty, not delay probability.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="w-44"
          options={[{ value: 'all', label: 'All Risk Levels' }, { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'moderate', label: 'Moderate' }, { value: 'low', label: 'Low' }]} />
      </div>

      {/* Prediction Cards */}
      <div className="space-y-4">
        {filtered.map((p, i) => <PredictionCard key={p.id} pred={p} index={i} />)}
      </div>

      {/* Model Metrics */}
      <Card>
        <CardHeader title="LSTM Model Evaluation Metrics" subtitle="Trained on synthetic historical dataset" icon={<Brain size={16} />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'MAE', value: '1.24 days', desc: 'Mean Absolute Error' },
            { label: 'RMSE', value: '1.87 days', desc: 'Root Mean Squared Error' },
            { label: 'R²', value: '0.81', desc: 'Coefficient of Determination' },
            { label: 'ROC-AUC', value: '0.89', desc: 'Area Under Curve' },
            { label: 'Precision', value: '84.2%', desc: 'Delay Classification' },
            { label: 'Recall', value: '79.6%', desc: 'Delay Classification' },
            { label: 'F1-Score', value: '81.8%', desc: 'Harmonic Mean' },
            { label: 'Baseline ΔR²', value: '+0.23', desc: 'vs Random Forest' },
          ].map(m => (
            <div key={m.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-lg font-bold text-indigo-600 mb-0.5">{m.value}</div>
              <div className="text-xs font-semibold text-slate-900">{m.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
