import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  MarkerType, NodeProps, Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GitBranch, Info, CheckCircle2, Loader2, AlertCircle, Clock, Zap } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/design';

const statusNodeColor: Record<string, string> = {
  completed: '#20C997',
  in_progress: '#28B8D5',
  not_started: '#929DB5',
  blocked: '#FF5C75',
  delayed: '#FFB84D',
};

const riskNodeColor: Record<string, string> = {
  low: '#20C997',
  moderate: '#FFB84D',
  high: '#FF8C42',
  critical: '#FF5C75',
};

// Custom Task Node
function TaskNode({ data }: NodeProps) {
  const borderColor = data.risk_level ? riskNodeColor[data.risk_level] : statusNodeColor[data.status] || '#64748B';
  const isCritical = data.on_critical_path;

  return (
    <div
      className="rounded-xl border-2 bg-white shadow-md px-4 py-3 min-w-[160px] max-w-[200px]"
      style={{
        borderColor: borderColor,
        boxShadow: isCritical ? `0 0 16px ${borderColor}30` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: borderColor, border: 'none' }} />

      {isCritical && (
        <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5 text-amber-600">
          ⚡ Critical Path
        </div>
      )}

      <div className="text-xs font-semibold text-slate-900 leading-tight mb-2">{data.label}</div>

      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: borderColor + '20', color: borderColor }}>
          {data.status?.replace('_', ' ')}
        </div>
        {data.delay_probability !== undefined && (
          <div className="text-[9px] font-bold" style={{ color: borderColor }}>
            {(data.delay_probability * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${data.completion || 0}%`, background: borderColor }}
        />
      </div>
      <div className="text-[9px] text-slate-500 font-medium mt-1">{data.assignee} · {data.completion}%</div>

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, border: 'none' }} />
    </div>
  );
}

const nodeTypes = { taskNode: TaskNode };

const initialNodes: Node[] = [
  { id: 'n1', type: 'taskNode', position: { x: 350, y: 50 }, data: { label: 'User Auth Module', status: 'completed', completion: 100, assignee: 'Emily Chen', delay_probability: 0.05, risk_level: 'low', on_critical_path: false } },
  { id: 'n2', type: 'taskNode', position: { x: 100, y: 220 }, data: { label: 'Product Catalog API', status: 'in_progress', completion: 65, assignee: 'James Lee', delay_probability: 0.42, risk_level: 'moderate', on_critical_path: false } },
  { id: 'n3', type: 'taskNode', position: { x: 600, y: 220 }, data: { label: 'Payment Gateway', status: 'blocked', completion: 30, assignee: 'Sarah Kim', delay_probability: 0.82, risk_level: 'critical', on_critical_path: true } },
  { id: 'n4', type: 'taskNode', position: { x: 100, y: 420 }, data: { label: 'Shopping Cart', status: 'in_progress', completion: 50, assignee: 'Tom Parker', delay_probability: 0.31, risk_level: 'moderate', on_critical_path: false } },
  { id: 'n5', type: 'taskNode', position: { x: 600, y: 420 }, data: { label: 'Order Processing', status: 'not_started', completion: 0, assignee: 'James Lee', delay_probability: 0.68, risk_level: 'high', on_critical_path: true } },
  { id: 'n6', type: 'taskNode', position: { x: 350, y: 600 }, data: { label: 'Checkout Flow', status: 'not_started', completion: 0, assignee: 'Emily Chen', delay_probability: 0.55, risk_level: 'high', on_critical_path: true } },
  { id: 'n7', type: 'taskNode', position: { x: 350, y: 780 }, data: { label: 'Production Deploy', status: 'not_started', completion: 0, assignee: 'DevOps Team', delay_probability: 0.45, risk_level: 'moderate', on_critical_path: true } },
];

const criticalEdgeStyle = { stroke: '#F59E0B', strokeWidth: 2.5, strokeDasharray: '6 3' };
const normalEdgeStyle = { stroke: '#CBD5E1', strokeWidth: 1.5 };

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', markerEnd: { type: MarkerType.ArrowClosed, color: '#94A3B8' }, style: normalEdgeStyle },
  { id: 'e1-3', source: 'n1', target: 'n3', markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' }, style: criticalEdgeStyle, label: 'Critical', labelStyle: { fill: '#D97706', fontSize: 10, fontWeight: 'bold' } },
  { id: 'e2-4', source: 'n2', target: 'n4', markerEnd: { type: MarkerType.ArrowClosed, color: '#94A3B8' }, style: normalEdgeStyle },
  { id: 'e3-5', source: 'n3', target: 'n5', markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' }, style: criticalEdgeStyle },
  { id: 'e4-6', source: 'n4', target: 'n6', markerEnd: { type: MarkerType.ArrowClosed, color: '#94A3B8' }, style: normalEdgeStyle },
  { id: 'e5-6', source: 'n5', target: 'n6', markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' }, style: criticalEdgeStyle },
  { id: 'e6-7', source: 'n6', target: 'n7', markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' }, style: criticalEdgeStyle },
];

const predictedDependencies = [
  { from: 'Shopping Cart', to: 'Order Processing', confidence: 0.91, reason: 'Strong temporal correlation — Shopping Cart always precedes Order Processing in 94% of historical project pairs' },
  { from: 'Product Catalog API', to: 'Checkout Flow', confidence: 0.76, reason: 'Shared data dependencies detected — Checkout Flow requires product pricing data from the Catalog API' },
];

export function DependencyIntelligencePage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: any) => setEdges(eds => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const nodeDetails = selectedNode
    ? { ...selectedNode.data, id: selectedNode.id }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dependency Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">Interactive task dependency graph with AI-predicted relationships</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium">
        {[
          { color: '#10B981', label: 'Completed' },
          { color: '#0284C7', label: 'In Progress' },
          { color: '#64748B', label: 'Not Started' },
          { color: '#EF4444', label: 'Blocked' },
          { color: '#F59E0B', label: 'Critical Path' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-slate-600">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs" style={{ height: 580 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#E2E8F0" gap={24} size={1} />
            <Controls className="!bg-white !border-slate-200 !text-slate-700 !shadow-sm !rounded-lg" />
            <MiniMap
              nodeColor={(n) => {
                const rl = n.data?.risk_level;
                return rl ? (riskNodeColor[rl] || '#94A3B8') : '#94A3B8';
              }}
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
            />
          </ReactFlow>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {nodeDetails ? (
            <Card>
              <CardHeader title="Task Details" icon={<GitBranch size={16} />} />
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Task Name</p>
                  <p className="font-semibold text-slate-900">{nodeDetails.label}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Status</p>
                    <p className="text-slate-800 capitalize text-xs font-medium">{nodeDetails.status?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Assignee</p>
                    <p className="text-slate-800 text-xs font-medium">{nodeDetails.assignee}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Delay Probability</p>
                  <p className="font-bold" style={{ color: nodeDetails.risk_level ? riskNodeColor[nodeDetails.risk_level] : '#64748B' }}>
                    {nodeDetails.delay_probability !== undefined ? `${(nodeDetails.delay_probability * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Completion</p>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" style={{ width: `${nodeDetails.completion || 0}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{nodeDetails.completion}%</p>
                </div>
                {nodeDetails.on_critical_path && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800 font-semibold">⚡ On Critical Path</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Any delay on this task will directly impact project completion date.</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <GitBranch size={28} className="text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">Click on a task node to view its details</p>
              </div>
            </Card>
          )}

          {/* Predicted Dependencies */}
          <Card>
            <CardHeader title="AI Dependency Suggestions" subtitle="Requires manager approval" icon={<Zap size={16} />} />
            <div className="space-y-3">
              {predictedDependencies.map((dep, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-indigo-100">
                  <div className="text-xs font-semibold text-slate-900 mb-1">
                    {dep.from} → {dep.to}
                  </div>
                  <div className="text-[10px] text-slate-600 mb-2 leading-relaxed">{dep.reason}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-600">{(dep.confidence * 100).toFixed(0)}% confidence</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="success" className="!text-[10px] !px-2 !py-0.5">Approve</Button>
                      <Button size="sm" variant="ghost" className="!text-[10px] !px-2 !py-0.5">Dismiss</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
