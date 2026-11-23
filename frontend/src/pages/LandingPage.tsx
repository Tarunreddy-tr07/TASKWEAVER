import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, Brain, GitBranch, TrendingUp, Beaker, Shield,
  BarChart3, CheckCircle2, Users, Clock, Target, Sparkles, ChevronRight,
  Layers, Terminal, Cpu, Database, Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Refined, subtle dependency network canvas
function DependencyNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 4 + 3,
      color: ['#6366F1', '#06B6D4', '#10B981', '#8B5CF6'][i % 4],
    }));

    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const targets = [ (i + 1) % nodes.length, (i + 3) % nodes.length ];
      for (const t of targets) {
        if (t !== i && Math.random() > 0.3) edges.push([i, t]);
      }
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Edges
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        const dist = Math.hypot(na.x - nb.x, na.y - nb.y);
        if (dist < 320) {
          const alpha = (1 - dist / 320) * 0.18;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      });

      // Nodes
      nodes.forEach((n) => {
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}

export function LandingPage() {
  const capabilities = [
    {
      icon: TrendingUp,
      title: 'Task Delay Forecasting',
      desc: 'Dual-head deep learning model predicts task delay probability and actual duration based on complexity, workload, and history.',
      badge: 'Deep Learning',
      color: '#6366F1',
    },
    {
      icon: GitBranch,
      title: 'Critical Path Analysis (CPM)',
      desc: 'Topological forward and backward passes calculate total and free float, pinpointing the exact bottleneck path that impacts deadlines.',
      badge: 'Graph Theory',
      color: '#06B6D4',
    },
    {
      icon: Sparkles,
      title: 'Smart Dependency Discovery',
      desc: 'Neural classifier scans task semantics and architecture ordering to suggest missing prerequisite relations with manager approval.',
      badge: 'Neural Classifier',
      color: '#8B5CF6',
    },
    {
      icon: Beaker,
      title: 'What-If Simulation Sandbox',
      desc: 'Test schedule crashing, delay ripple effects, and scope creep dynamically across the entire project DAG before changes happen.',
      badge: 'Simulation',
      color: '#F59E0B',
    },
    {
      icon: Users,
      title: 'Workload & Capacity Intelligence',
      desc: 'Real-time developer utilization metrics detect overallocation and recommend balanced reassignments without burning out your team.',
      badge: 'Optimization',
      color: '#10B981',
    },
    {
      icon: Brain,
      title: 'Context-Aware AI Assistant',
      desc: 'Grounded in live database state and machine learning predictions, query your delivery status with natural language via Groq LLaMA 3.3.',
      badge: 'LLM Assistant',
      color: '#EC4899',
    },
  ];

  const techPills = [
    { name: 'Scikit-Learn / TensorFlow', type: 'Deep MLP & LSTM Models', icon: Cpu },
    { name: 'NetworkX CPM Engine', type: 'Topological DAG Analysis', icon: GitBranch },
    { name: 'FastAPI & SQLAlchemy 2.0', type: 'High-Throughput Async Backend', icon: Terminal },
    { name: 'React 18 & TypeScript', type: 'Modern Reactive Frontend', icon: Layers },
    { name: 'SQLite / PostgreSQL', type: 'Transactional Data Store', icon: Database },
    { name: 'Groq LLaMA 3.3 70B', type: 'Context-Grounded AI Insights', icon: Brain },
  ];

  const liveTasks = [
    { name: 'Backend Payment Gateway Integration', prob: 82, extra: '+4d', status: 'critical', crit: true },
    { name: 'Product Catalog Database Migration', prob: 52, extra: '+2d', status: 'high', crit: false },
    { name: 'React Component Design System', prob: 31, extra: '+1d', status: 'moderate', crit: false },
    { name: 'OAuth2 Authentication Module', prob: 12, extra: 'On Time', status: 'low', crit: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Zap size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">TASKWEAVER</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold -mt-0.5">Project Intelligence</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#technology" className="hover:text-slate-900 transition-colors">Technology</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#simulation" className="hover:text-slate-900 transition-colors">Simulation</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden">
        <DependencyNetwork />

        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-sky-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-8 shadow-sm backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            TASKWEAVER AI 2.0 · Deep Learning Task Forecasting & CPM Simulation
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-6 max-w-5xl mx-auto"
          >
            Predict Delays. <br />
            <span className="gradient-text">Understand Dependencies.</span> <br />
            Deliver Smarter.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            An enterprise project intelligence platform combining genuine deep learning delay prediction, 
            graph-based Critical Path Method (CPM), cascading delay propagation, and What-If simulation.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-500/25" iconRight={<ArrowRight size={18} />}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 py-3.5 rounded-xl border-slate-300 hover:border-slate-400 bg-white text-slate-800 shadow-sm hover:bg-slate-50">
                Explore Demo Workspace
              </Button>
            </Link>
          </motion.div>

          {/* Metrics Proof Bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-lg max-w-4xl mx-auto text-left"
          >
            {[
              { label: 'Forecast Accuracy', value: '94.2%', sub: 'Holdout test evaluation' },
              { label: 'CPM Compute Speed', value: '< 50ms', sub: 'NetworkX topological pass' },
              { label: 'Manager Approved', value: '100%', sub: 'Human-in-the-loop control' },
              { label: 'Production Ready', value: 'Enterprise', sub: 'FastAPI + SQLAlchemy async' },
            ].map((m) => (
              <div key={m.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                <div className="text-xs font-semibold text-slate-700">{m.label}</div>
                <div className="text-[11px] text-slate-500">{m.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Platform Mockup Section */}
      <section className="py-20 relative border-t border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">Live Workspace Preview</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-3">Complete Visibility Over Delivery Health</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Real-time synchronization between task execution, neural delay estimates, and critical path schedules.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* macOS Browser Header */}
            <div className="h-10 bg-slate-100/80 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="px-6 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-600 shadow-xs">
                https://taskweaver.app/projects/e-commerce-rebuild
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Activity size={13} className="text-emerald-600" />
                <span className="font-medium">Live Model Sync</span>
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Project Completion', value: '72%', status: '+4% this sprint', color: '#4F46E5' },
                  { label: 'Predicted Delay', value: '4 Days', status: 'Critical Path Risk', color: '#DC2626' },
                  { label: 'Active Critical Tasks', value: '3 Tasks', status: 'Zero Float Slack', color: '#D97706' },
                  { label: 'Team Utilization', value: '84%', status: 'Within Normal Threshold', color: '#059669' },
                ].map((k) => (
                  <div key={k.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-xs text-slate-500 font-medium mb-1">{k.label}</div>
                    <div className="text-2xl font-bold mb-1" style={{ color: k.color }}>{k.value}</div>
                    <div className="text-[11px] text-slate-500">{k.status}</div>
                  </div>
                ))}
              </div>

              {/* Tasks & Prediction Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Active Tasks & Delay Risk</span>
                    <span className="text-xs text-indigo-600 font-semibold">Model: Deep MLP v1.0</span>
                  </div>

                  {liveTasks.map((t) => (
                    <div key={t.name} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.prob > 60 ? 'bg-rose-500' : t.prob > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div className="truncate">
                          <span className="text-sm font-medium text-slate-900 block truncate">{t.name}</span>
                          {t.crit && <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">Critical Path</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 pl-3">
                        <span className="text-xs font-mono font-bold text-slate-700">{t.prob}% Risk</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">{t.extra}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain size={16} className="text-indigo-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">AI Risk Advisory</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      <strong className="text-slate-900">Payment Gateway Integration</strong> has a 82% delay probability driven by assigned developer workload (87%) and high architectural complexity.
                    </p>
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200/60 text-[11px] text-indigo-900 space-y-1">
                      <div className="font-semibold text-indigo-950">Recommended Action:</div>
                      <div>Reassign 2 secondary backlog items to Emily Chen to reduce James Lee utilization to 65%.</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Manager Approval:</span>
                    <span className="text-emerald-600 font-semibold">Pending Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Bento Grid */}
      <section id="capabilities" className="py-28 relative bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-3">Intelligence Across Every Phase</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              From individual task forecasting to project-wide Monte Carlo simulations, manage schedules with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="p-7 rounded-2xl bg-white card-hover border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}15`, color: c.color }}>
                      <c.icon size={22} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border" style={{ borderColor: `${c.color}30`, color: c.color, backgroundColor: `${c.color}10` }}>
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">{c.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-28 relative bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-600">Technology Stack</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-3">Engineered on Proven Scientific Foundations</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Built on genuine machine learning pipelines and graph theory — never hardcoded estimates or random generators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {techPills.map((t) => (
              <div key={t.name} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <t.icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{t.name}</div>
                  <div className="text-xs text-slate-500 truncate">{t.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TASKWEAVER / Workflow Section */}
      <section id="workflow" className="py-28 relative bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">Why TASKWEAVER?</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-6 leading-tight">
                Predict. Adapt. Deliver. <br />
                Without Surprises.
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Non-Deterministic Machine Learning',
                    desc: 'Dual-head neural networks infer delay probabilities from historical data, active workload, and structural dependencies.',
                  },
                  {
                    title: 'Deterministic Critical Path Guarantee',
                    desc: 'Mathematical PERT/CPM calculations ensure float and schedule bottlenecks are calculated with 100% precision.',
                  },
                  {
                    title: 'Human-in-the-Loop Governance',
                    desc: 'AI suggestions never auto-reassign tasks or auto-create dependencies. The system advises; managers decide.',
                  },
                  {
                    title: 'Proactive What-If Simulations',
                    desc: 'Simulate delay ripple effects and resource reassignments before committing to stakeholder milestones.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600" />
                  <span className="text-sm font-bold text-slate-900">Delay Propagation Simulator</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  DAG Real-Time
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex justify-between text-xs text-slate-600 mb-2">
                  <span>Injected Delay on Critical Task</span>
                  <span className="text-amber-600 font-bold">+5 Days</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-3/4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-500 mb-1">Downstream Impact</div>
                  <div className="text-xl font-bold text-rose-600">+5.0 Days</div>
                  <div className="text-[10px] text-slate-400">Critical Path Shifted</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-500 mb-1">Affected Tasks</div>
                  <div className="text-xl font-bold text-amber-600">3 Dependent</div>
                  <div className="text-[10px] text-slate-400">Zero Slack Available</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <strong className="text-emerald-900">Optimization Opportunity:</strong> Fast-tracking <em>UI Component Library</em> by adding 1 contributor compresses critical duration by 3.0 days.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-24 relative overflow-hidden bg-slate-50/50 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="p-10 md:p-16 rounded-3xl bg-white border border-indigo-100 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
              Ready to Deliver Projects On Time?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Experience the power of deep learning delay forecasting, NetworkX critical path calculation, and intelligent What-If simulation today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-500/20" iconRight={<ArrowRight size={18} />}>
                  Start Free Now
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 py-3.5 rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs">
                  Sign In with Demo Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-xs">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">TASKWEAVER</span>
              <span className="text-[11px] text-slate-500 ml-2">Predict. Understand. Deliver.</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link to="/login" className="hover:text-slate-900 transition-colors">Demo Login</Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors">Register</Link>
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#technology" className="hover:text-slate-900 transition-colors">Technology</a>
          </div>

          <div className="text-xs text-slate-500">
            © 2026 TASKWEAVER. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
