import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Clock, Sliders, CheckCircle2, Download, AlertCircle, Loader2 } from 'lucide-react';

export default function Governance() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
      const res = await fetch(`${baseUrl}/api/audit`);
      const data = await res.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditReport = () => {
    const rows = [['Action', 'Time', 'Confidence', 'Module'], ...auditLogs.map(log => [log.action, log.time, `${log.score}%`, log.module])];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'neurafin-compliance-audit.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Governance & Audit Trail</h2>
          <p className="text-slate-400 text-xs mt-0.5">Full explainability, confidence thresholds, and immutable decision logging</p>
        </div>
        <button 
          onClick={exportAuditReport}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 shadow-md flex items-center transition-all"
        >
          <Download size={14} className="mr-2 text-blue-400" /> Export Compliance Audit
        </button>
      </div>

      {/* Grid: Thresholds & Model Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Threshold Controls */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl">
          <h3 className="font-bold text-white text-base mb-4 flex items-center">
            <Sliders className="mr-2 text-blue-400" size={18} /> Conservative Routing Thresholds
          </h3>
          <div className="space-y-6">
            
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-slate-200">Tier 1 Auto-Execute Threshold</span>
                <span className="font-extrabold text-cyan-400">≥ 90% Confidence</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style={{ width: '90%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Transactions meeting ≥90% confidence are executed straight-through without human touchpoints.
              </p>
            </div>
            
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-slate-200">Tier 2 AI-Recommend Threshold</span>
                <span className="font-extrabold text-amber-400">70% - 89% Confidence</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Transactions in this band require explicit single-click human signoff before posting.
              </p>
            </div>

          </div>
        </div>

        {/* Model Review Metrics */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl">
          <h3 className="font-bold text-white text-base mb-4 flex items-center">
            <Activity className="mr-2 text-indigo-400" size={18} /> Continuous Governance Telemetry
          </h3>
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4 text-xs">
             <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
               <span className="text-slate-400">Total Autonomous Decisions (Rolling 30d)</span>
               <span className="font-extrabold text-white text-sm">14,205</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
               <span className="text-slate-400">Human Disagreement Rate (Tier 2)</span>
               <span className="font-bold text-amber-400">4.2%</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
               <span className="text-slate-400">False Positives Recalled (Standing Override)</span>
               <span className="font-bold text-emerald-400">0.12% (17 total)</span>
             </div>
             <div className="flex justify-between items-center py-1">
               <span className="text-slate-400">Model Calibration Review Cycle</span>
               <span className="font-semibold text-slate-300">Monthly Scheduled</span>
             </div>

             <div className="mt-4 pt-3 border-t border-slate-800/80">
               <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                 <CheckCircle2 size={14} className="shrink-0" />
                 <span>ISO 42001 & AI Risk Governance Guardrails Enforced</span>
               </div>
             </div>
          </div>
        </div>

      </div>

      {/* Immutable Reasoning Audit Trail Container */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-sm">Immutable Reasoning Trail (Live)</h3>
            <p className="text-xs text-slate-400">Chronological ledger of autonomous and assisted enterprise executions</p>
          </div>
          <button 
            onClick={fetchAuditLogs}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Refresh Logs
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin text-blue-400" />
            <span className="text-xs">Loading audit ledger from database...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs border ${
                    log.score >= 90 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                    log.score >= 70 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {log.score}%
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{log.action}</p>
                    <div className="flex items-center text-[11px] text-slate-400 mt-0.5 space-x-2">
                       <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                         {log.module}
                       </span>
                       <span>Confidence Score: {log.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium flex items-center">
                  <Clock size={13} className="mr-1.5 text-slate-400" />
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
