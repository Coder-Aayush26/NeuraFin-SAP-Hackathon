import React, { useEffect, useState } from 'react';
import { Bot, Clock, TrendingDown, RefreshCw, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [kpiData] = useState([
    { title: 'Decision Volume Automated', value: '62%', trend: 'Target: 60%', icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { title: 'Invoice-to-Pay Cycle', value: '4.5 days', trend: 'Down from 12d', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Maverick Spend Rate', value: '7.8%', trend: 'Down from 18%', icon: TrendingDown, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Reconciliation Close', value: '1.2 days', trend: 'Down from 8d', icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ]);
  
  useEffect(() => {
    api('/api/dashboard').then(setDashboardData).catch(error => console.error('Failed to fetch dashboard data:', error));
  }, []);

  const TIER_STATS = [
    { name: 'Tier 1 (Auto-Execute)', value: dashboardData?.tierCounts?.[0] || 0, color: '#38bdf8' },
    { name: 'Tier 2 (AI-Recommend)', value: dashboardData?.tierCounts?.[1] || 0, color: '#818cf8' },
    { name: 'Tier 3 (Human-Only)', value: dashboardData?.tierCounts?.[2] || 0, color: '#64748b' },
  ];

  const MONTHLY_TREND = [
    { month: 'Jan', auto: 15, manual: 85 },
    { month: 'Feb', auto: 22, manual: 78 },
    { month: 'Mar', auto: 35, manual: 65 },
    { month: 'Apr', auto: 48, manual: 52 },
    { month: 'May', auto: 55, manual: 45 },
    { month: 'Jun', auto: 62, manual: 38 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome & Global Standing Override Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-blue-950/60 p-6 md:p-8 backdrop-blur-xl border border-slate-700/60 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-3">
              <Sparkles size={13} />
              <span>Autonomous Finance & Procurement Suite</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Command Center
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Live enterprise operations monitor. {dashboardData ? `${dashboardData.automatedPercent}%` : '...'} of transactional decisions are executing autonomously under active governance guardrails.
            </p>
          </div>

          <div className="flex items-center bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md">
            <ShieldAlert size={22} className="mr-3 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-200 uppercase tracking-wider block">Standing Override Active</span>
              <span className="text-slate-300">All Tier-1 AI decisions remain recallable for 48h.</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with Modern Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => (
          <div 
            key={idx} 
            className="group relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-lg hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl border ${kpi.bg}`}>
                <kpi.icon className={kpi.color} size={22} />
              </div>
              <ArrowUpRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{kpi.value}</h3>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium flex items-center">
                <CheckCircle2 size={13} className="mr-1" /> {kpi.trend}
              </span>
              <span className="text-slate-400">vs benchmark</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tier Split Card */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Decision Volume Split</h3>
              <p className="text-xs text-slate-400">Automated vs Assisted vs Human Routing</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
              60% Autonomous Target
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={TIER_STATS} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={3} 
                  dataKey="value"
                >
                  {TIER_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            60% combined auto-execution and assisted workflow volume achieved this quarter.
          </p>
        </div>

        {/* Automation Adoption Trend */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Automation Adoption Trajectory</h3>
              <p className="text-xs text-slate-400">Monthly progression of autonomous decisions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              +47% in 6 months
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" textAnchor="middle" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend 
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
                <Line type="monotone" dataKey="auto" name="Autonomous (%)" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8' }} />
                <Line type="monotone" dataKey="manual" name="Manual Review (%)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
