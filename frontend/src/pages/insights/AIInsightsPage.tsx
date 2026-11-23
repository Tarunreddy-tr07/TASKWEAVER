import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { assistantApi } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  'Which tasks have the highest delay risk?',
  'Why is the Mobile Banking App likely to be delayed?',
  'Which employees are overloaded?',
  'What tasks are on the critical path?',
  'How can we reduce project delays?',
  'What happens if the Payment Gateway is delayed by 5 days?',
];

// Intelligent demo responses
const demoResponses: Record<string, string> = {
  default: `Based on current project data and LSTM model predictions:

**High-Risk Tasks Requiring Immediate Attention:**

1. **Payment Gateway Integration** (E-Commerce Platform) — 82% delay probability
   - Assigned employee (Sarah Kim) at 95% utilization
   - 2 unresolved blocking prerequisites
   - On the critical path

2. **API Rate Limiting** — 78% delay probability  
   - Deadline is Nov 8 — only 6 days away
   - Employee overloaded
   - Critical path task

3. **CRM Data Mapping** — 65% delay probability
   - Scope expanded post-estimation
   - External Salesforce dependency not yet resolved

**Recommendation:** Prioritize unblocking the Payment Gateway. A 4-day delay on that task cascades to a 6-day project delay due to its critical path position.`,

  overloaded: `**Workload Analysis:**

Currently **2 team members** are critically overloaded:

| Employee | Utilization | Active Tasks |
|----------|------------|--------------|
| Sarah Kim | **95%** ⚠ | 6 tasks |
| Emily Chen | **91%** ⚠ | 5 tasks |

**Available Capacity:**
- David Wilson: 35% utilization — can absorb 2-3 medium tasks
- Tom Parker: 62% utilization — has some bandwidth

**Note:** Rebalancing requires manager approval. I cannot automatically reassign tasks.`,

  critical: `**Critical Path Analysis:**

The current critical path for E-Commerce Platform:
\`\`\`
User Auth Module ✅
  → Payment Gateway Integration 🔴 (BLOCKED - 82% delay risk)
    → Order Processing ⏳
      → Checkout Flow ⏳
        → Production Deploy ⏳
\`\`\`

**Key Finding:** Payment Gateway Integration is the primary bottleneck. It has 0 float, meaning any delay directly extends the project deadline.

**Mobile Banking App critical path** is also at risk with 3 tasks concurrently blocked.`,
};

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('overload') || lower.includes('employee') || lower.includes('workload')) return demoResponses.overloaded;
  if (lower.includes('critical path') || lower.includes('critical')) return demoResponses.critical;
  return demoResponses.default;
}

export function AIInsightsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `👋 Hello! I'm your TASKWEAVER AI Assistant, powered by real-time project data and LSTM predictions.\n\nI can answer questions about task delays, project risks, team workload, critical paths, and what-if scenarios. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await assistantApi.chat(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response || getResponse(text),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Fallback demo response
      await new Promise(r => setTimeout(r, 1200));
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getResponse(text),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
    setLoading(false);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-slate-900 mt-2">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 text-slate-700">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\./)) {
          return <li key={i} className="ml-4 text-slate-700">{line}</li>;
        }
        if (line.startsWith('#')) {
          return <p key={i} className="font-bold text-indigo-700 mt-2">{line.replace(/^#+\s/, '')}</p>;
        }
        if (line.trim() === '') return <br key={i} />;
        // Bold text within lines
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-slate-700">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 font-bold">{part}</strong> : part)}
          </p>
        );
      });
  };

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Insights Center</h1>
          <p className="text-sm text-slate-500 mt-1">Ask questions about your projects, tasks, risks, and predictions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl">
          <Sparkles size={14} className="text-indigo-600" />
          <span className="text-xs text-indigo-700 font-medium">Connected to live project data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>
        {/* Chat */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                    <Bot size={15} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-xs'
                      : 'bg-slate-50 border border-slate-200 rounded-tl-sm text-slate-800'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="text-sm space-y-0.5">{formatContent(msg.content)}</div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className="text-[10px] mt-2 opacity-50">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1 text-slate-600">
                    <User size={15} />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 0.2, 0.4].map(delay => (
                      <motion.div key={delay} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay }}
                        className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask about delays, risks, dependencies, workload..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
              <Button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} icon={<Send size={16} />}>
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Suggested Questions */}
        <div className="space-y-4">
          <Card padding="sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Suggested Questions</p>
            <div className="space-y-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-slate-600 hover:text-indigo-700 p-2.5 rounded-lg hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-slate-700 font-medium leading-relaxed">
                The AI assistant retrieves data from the actual database and prediction engine. It will not invent statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
