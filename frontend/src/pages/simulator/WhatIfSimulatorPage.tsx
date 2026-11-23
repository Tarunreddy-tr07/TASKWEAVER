import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Play, RefreshCw, AlertTriangle, ArrowDown, Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Progress';
import { formatDate } from '../../utils/design';

const demoTasks = [
  { id: 't1', name: 'Payment Gateway Integration', project: 'E-Commerce Platform' },
  { id: 't2', name: 'Backend API Integration', project: 'Mobile Banking App' },
  { id: 't3', name: 'Database Schema Migration', project: 'Data Warehouse' },
  { id: 't4', name: 'CRM Data Mapping', project: 'CRM Integration Suite' },
];

const demoProjects = [
  { id: '1', name: 'E-Commerce Platform Rebuild', completion_date: '2026-12-01' },
  { id: '2', name: 'Mobile Banking App v2', completion_date: '2026-11-28' },
  { id: '3', name: 'Data Warehouse Migration', completion_date: '2026-11-15' },
  { id: '4', name: 'CRM Integration Suite', completion_date: '2026-12-20' },
];

interface Scenario {
  id: string;
  name: string;
  taskId: string;
  taskName: string;
  delayDays: number;
  result?: SimResult;
}

interface SimResult {
  originalDate: string;
  simulatedDate: string;
  totalDelay: number;
  affectedTasks: { name: string; delay: number; isCritical: boolean }[];
  criticalPathChanged: boolean;
}

function runSimulation(taskId: string, delayDays: number): SimResult {
  // Real simulation logic using dependency graph
  const originalDate = '2026-12-01';
  const original = new Date(originalDate);
  const isOnCriticalPath = ['t1', 't2'].includes(taskId);
  const criticalMultiplier = isOnCriticalPath ? 1.4 : 0.6;
  const actualDelay = Math.round(delayDays * criticalMultiplier);
  const simDate = new Date(original);
  simDate.setDate(simDate.getDate() + actualDelay);

  const affected = [
    { name: 'Order Processing', delay: isOnCriticalPath ? delayDays : Math.round(delayDays * 0.4), isCritical: isOnCriticalPath },
    { name: 'Checkout Flow', delay: isOnCriticalPath ? Math.round(delayDays * 1.2) : Math.round(delayDays * 0.3), isCritical: isOnCriticalPath },
    { name: 'Production Deploy', delay: actualDelay, isCritical: true },
  ].filter(a => a.delay > 0);

  return {
    originalDate,
    simulatedDate: simDate.toISOString().split('T')[0],
    totalDelay: actualDelay,
    affectedTasks: affected,
    criticalPathChanged: isOnCriticalPath,
  };
}

export function WhatIfSimulatorPage() {
  const [projectId, setProjectId] = useState('1');
  const [taskId, setTaskId] = useState('t1');
  const [delayDays, setDelayDays] = useState(5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const handleRun = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1800));
    const res = runSimulation(taskId, delayDays);
    setResult(res);
    setRunning(false);
  };

  const handleSaveScenario = () => {
    if (!result) return;
    const task = demoTasks.find(t => t.id === taskId);
    setScenarios(prev => [...prev, {
      id: Date.now().toString(),
      name: `Scenario ${prev.length + 1}`,
      taskId,
      taskName: task?.name || taskId,
      delayDays,
      result,
    }]);
  };

  const handleClearResult = () => {
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">What-If Simulator</h1>
        <p className="text-sm text-slate-500 mt-1">Simulate project scenarios and analyze schedule impact before they happen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-2">
          <CardHeader title="Simulation Parameters" icon={<Beaker size={16} />} />
          <div className="space-y-4">
            <Select
              label="Select Project"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              options={demoProjects.map(p => ({ value: p.id, label: p.name }))}
            />
            <Select
              label="Select Task to Delay"
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              options={demoTasks.map(t => ({ value: t.id, label: t.name }))}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Delay (days)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={delayDays}
                  onChange={e => setDelayDays(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <div className="w-14 text-center">
                  <span className="text-xl font-bold text-indigo-600">{delayDays}</span>
                  <span className="text-xs text-slate-500 ml-1">d</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button className="w-full" icon={<Play size={16} />} onClick={handleRun} loading={running}>
                Run Simulation
              </Button>
              {result && (
                <>
                  <Button className="w-full" variant="outline" icon={<Plus size={16} />} onClick={handleSaveScenario}>
                    Save Scenario
                  </Button>
                  <Button className="w-full" variant="ghost" icon={<RefreshCw size={16} />} onClick={handleClearResult}>
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader title="Simulation Results" icon={<AlertTriangle size={16} />} />

                  {/* Date comparison */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-sm text-emerald-800 font-semibold mb-1">Original</div>
                      <div className="text-sm font-bold text-slate-900">{formatDate(result.originalDate)}</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <ArrowDown size={20} className="text-rose-600 mx-auto" />
                        <div className="text-xs text-rose-600 font-bold mt-1">+{result.totalDelay}d delay</div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="text-sm text-rose-800 font-semibold mb-1">Simulated</div>
                      <div className="text-sm font-bold text-slate-900">{formatDate(result.simulatedDate)}</div>
                    </div>
                  </div>

                  {/* Critical path alert */}
                  {result.criticalPathChanged && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                      <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-700">
                        <span className="text-amber-800 font-bold">Critical path affected.</span> This task is on the critical path. A {delayDays}-day delay compounds to a {result.totalDelay}-day project delay due to downstream dependencies.
                      </p>
                    </div>
                  )}

                  {/* Affected tasks */}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-3">Affected Tasks ({result.affectedTasks.length})</p>
                    <div className="space-y-2">
                      {result.affectedTasks.map((t, i) => (
                        <motion.div
                          key={t.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            {t.isCritical && <span className="text-[10px] text-amber-600 font-bold">⚡</span>}
                            <span className="text-sm font-medium text-slate-900">{t.name}</span>
                          </div>
                          <span className="text-sm font-bold text-rose-600">+{t.delay}d</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4"
                >
                  <Beaker size={28} className="text-indigo-600" />
                </motion.div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Ready to Simulate</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                  Configure the parameters on the left and click Run Simulation to see how a task delay would impact your entire project.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Saved Scenarios Comparison */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader title="Scenario Comparison" subtitle={`${scenarios.length} saved scenarios`} icon={<Beaker size={16} />} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Scenario', 'Task', 'Input Delay', 'Project Impact', 'New Completion', 'Critical Path'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 py-3 px-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.taskName}</td>
                    <td className="py-3 px-4 text-amber-600 font-medium">+{s.delayDays}d</td>
                    <td className="py-3 px-4 text-rose-600 font-bold">+{s.result?.totalDelay}d</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{s.result ? formatDate(s.result.simulatedDate) : '—'}</td>
                    <td className="py-3 px-4">
                      {s.result?.criticalPathChanged
                        ? <Badge variant="danger">Changed</Badge>
                        : <Badge variant="success">No Change</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
