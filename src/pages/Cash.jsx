import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';

const statusStyles = {
  matched: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  exception: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
};

export default function Cash() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    try {
      setApplications(await api('/api/cash'));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  const matchApplication = async (id) => {
    setProcessingId(id);
    try {
      const updated = await api(`/api/cash/${id}/match`, { method: 'POST' });
      setApplications(previous => previous.map(item => item.id === id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Cash Application</h2>
          <p className="text-slate-400 text-xs mt-0.5">Match incoming receipts to open customer balances with confidence controls</p>
        </div>
        <button type="button" onClick={loadApplications} className="text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl flex items-center">
          <RefreshCw size={14} className="mr-2" /> Refresh feed
        </button>
      </div>

      {error && <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Receipts today', applications.length, CreditCard],
          ['Auto-matched', applications.filter(item => item.status === 'matched').length, CheckCircle2],
          ['Exceptions', applications.filter(item => item.status === 'exception').length, ShieldAlert]
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg">
            <Icon size={20} className="text-cyan-400 mb-4" />
            <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <h3 className="font-bold text-white text-sm">Incoming receipt worklist</h3>
        </div>
        {loading ? <div className="p-12 text-center text-slate-400"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></div> : (
          <div className="divide-y divide-slate-800/60">
            {applications.map(application => (
              <div key={application.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="lg:w-1/4"><p className="font-bold text-white text-sm">{application.id}</p><p className="text-xs text-slate-400 mt-1">{application.customer}</p></div>
                <div className="lg:w-1/4"><p className="text-lg font-bold text-white">{application.amount}</p><p className="text-xs text-slate-400">Reference: {application.reference}</p></div>
                <div className="lg:flex-1"><span className={`inline-flex text-[11px] font-bold uppercase border rounded-full px-2.5 py-1 ${statusStyles[application.status] || statusStyles.pending}`}>{application.status}</span><p className="text-xs text-slate-400 mt-2">{application.confidence}% confidence match</p></div>
                <div className="lg:w-44">{application.status === 'matched' ? <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center"><CheckCircle2 size={14} className="mr-1.5" /> Applied to account</div> : <button type="button" onClick={() => matchApplication(application.id)} disabled={processingId === application.id} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-center">{processingId === application.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <ArrowRight size={14} className="mr-2" />} Match receipt</button>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
