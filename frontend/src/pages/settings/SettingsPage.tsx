import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Shield, Save } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'thresholds', label: 'Risk Thresholds', icon: Shield },
];

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [thresholds, setThresholds] = useState({ low: 25, moderate: 50, high: 75 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Settings saved!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-5 max-w-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-xl font-bold shadow-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <p className="text-xs text-indigo-600 font-semibold capitalize">{user?.role}</p>
              </div>
            </div>
            <Input label="Full Name" defaultValue={user?.name || ''} />
            <Input label="Email Address" type="email" defaultValue={user?.email || ''} />
            <Input label="Role" defaultValue={user?.role || ''} disabled />
            <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Profile</Button>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-5 max-w-md">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="Min. 8 characters" />
            <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
            <Button onClick={handleSave} loading={saving}>Update Password</Button>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 max-w-md">
            {[
              { label: 'Risk alerts for critical tasks', def: true },
              { label: 'AI delay predictions', def: true },
              { label: 'Task assignment notifications', def: true },
              { label: 'Project milestone updates', def: false },
              { label: 'Dependency suggestion approvals', def: true },
              { label: 'Weekly summary reports', def: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-medium text-slate-900">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.def} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:ring-2 peer-focus:ring-indigo-600 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
            <Button onClick={handleSave} loading={saving}>Save Preferences</Button>
          </div>
        );
      case 'thresholds':
        return (
          <div className="space-y-6 max-w-lg">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700 font-medium">
              Configure the delay probability thresholds that determine risk categorization across all predictions.
            </div>
            {[
              { key: 'low' as const, label: 'Low Risk Upper Bound', color: '#10B981', range: [5, 40] },
              { key: 'moderate' as const, label: 'Moderate Risk Upper Bound', color: '#F59E0B', range: [30, 65] },
              { key: 'high' as const, label: 'High Risk Upper Bound', color: '#F97316', range: [50, 90] },
            ].map(t => (
              <div key={t.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold" style={{ color: t.color }}>{t.label}</label>
                  <span className="text-sm font-bold" style={{ color: t.color }}>{thresholds[t.key]}%</span>
                </div>
                <input
                  type="range"
                  min={t.range[0]}
                  max={t.range[1]}
                  value={thresholds[t.key]}
                  onChange={e => setThresholds(prev => ({ ...prev, [t.key]: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1 font-medium">
                  <span>{t.range[0]}%</span><span>{t.range[1]}%</span>
                </div>
              </div>
            ))}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-600 font-semibold mb-1">Current thresholds:</p>
              <p className="text-emerald-700 font-medium">LOW: 0–{thresholds.low}%</p>
              <p className="text-amber-700 font-medium">MODERATE: {thresholds.low + 1}–{thresholds.moderate}%</p>
              <p className="text-orange-700 font-medium">HIGH: {thresholds.moderate + 1}–{thresholds.high}%</p>
              <p className="text-rose-700 font-medium">CRITICAL: {thresholds.high + 1}–100%</p>
            </div>
            <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Thresholds</Button>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">The TASKWEAVER light theme provides clear contrast and sleek readability across all project intelligence modules.</p>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-indigo-200">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500" />
              <span className="text-sm font-semibold text-slate-900">TASKWEAVER Clean White (Active)</span>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, preferences, and platform configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <Card padding="sm">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title={tabs.find(t => t.key === activeTab)?.label || ''} />
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {renderContent()}
            </motion.div>
          </Card>
        </div>
      </div>
    </div>
  );
}
