import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Scale, TriangleAlert } from 'lucide-react';
import { api } from '../lib/api';

const money = value => `INR ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function Recon() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try { setItems(await api('/api/reconciliation')); setError(''); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadItems(); }, []);

  const reconcile = async id => {
    setProcessingId(id);
    try {
      const updated = await api(`/api/reconciliation/${id}/reconcile`, { method: 'POST' });
      setItems(previous => previous.map(item => item.id === id ? updated : item));
    } catch (requestError) { setError(requestError.message); } finally { setProcessingId(null); }
  };

  const pending = items.filter(item => item.status !== 'reconciled');
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h2 className="text-2xl font-bold text-white tracking-tight">Continuous Reconciliation</h2><p className="text-slate-400 text-xs mt-0.5">Compare subledger balances to the general ledger and clear exceptions</p></div>
        <button type="button" onClick={loadItems} className="text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl flex items-center"><RefreshCw size={14} className="mr-2" /> Refresh balances</button>
      </div>
      {error && <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5"><Scale size={20} className="text-cyan-400 mb-4" /><p className="text-xs text-slate-400 uppercase tracking-wider">Accounts checked</p><p className="text-3xl font-extrabold text-white mt-1">{items.length}</p></div>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5"><CheckCircle2 size={20} className="text-emerald-400 mb-4" /><p className="text-xs text-slate-400 uppercase tracking-wider">Reconciled</p><p className="text-3xl font-extrabold text-white mt-1">{items.length - pending.length}</p></div>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5"><TriangleAlert size={20} className="text-amber-400 mb-4" /><p className="text-xs text-slate-400 uppercase tracking-wider">Open variance</p><p className="text-3xl font-extrabold text-white mt-1">{money(pending.reduce((sum, item) => sum + Math.abs(item.variance), 0))}</p></div>
      </div>
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40"><h3 className="font-bold text-white text-sm">Balance comparison</h3></div>
        {loading ? <div className="p-12 text-center text-slate-400"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></div> : <div className="divide-y divide-slate-800/60">{items.map(item => <div key={item.id} className="p-5 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 items-center"><div><p className="font-bold text-white text-sm">{item.account}</p><p className="text-xs text-slate-500 mt-1">{item.id}</p></div><div><p className="text-[11px] uppercase text-slate-500">Subledger</p><p className="text-sm text-slate-200 mt-1">{money(item.subledger_amount)}</p></div><div><p className="text-[11px] uppercase text-slate-500">General ledger</p><p className="text-sm text-slate-200 mt-1">{money(item.gl_amount)}</p></div><div><p className="text-[11px] uppercase text-slate-500">Variance</p><p className={`text-sm font-bold mt-1 ${item.variance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{money(item.variance)}</p></div><div>{item.status === 'reconciled' ? <span className="text-xs text-emerald-400 font-semibold flex items-center"><CheckCircle2 size={14} className="mr-1" /> Cleared</span> : <button type="button" onClick={() => reconcile(item.id)} disabled={processingId === item.id} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-2 rounded-xl">{processingId === item.id ? <Loader2 size={14} className="animate-spin" /> : 'Mark reconciled'}</button>}</div></div>)}</div>}
      </div>
    </div>
  );
}
