import React, { useEffect, useState } from 'react';
import { BadgeDollarSign, Loader2, Search, Sparkles, Target, Users } from 'lucide-react';
import { api } from '../lib/api';

export default function Sourcing() {
  const [data, setData] = useState({ requests: [], vendors: [] });
  const [form, setForm] = useState({ item: '', category: 'Raw Materials', budget: '' });
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try { setData(await api('/api/sourcing')); setError(''); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const runSourcing = async event => {
    event.preventDefault();
    setRunning(true);
    try { const response = await api('/api/sourcing/run', { method: 'POST', body: JSON.stringify({ ...form, budget: Number(form.budget) }) }); setResult(response); setData(previous => ({ ...previous, requests: [response.request, ...previous.requests] })); setError(''); } catch (requestError) { setError(requestError.message); } finally { setRunning(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div><h2 className="text-2xl font-bold text-white tracking-tight">AI Sourcing</h2><p className="text-slate-400 text-xs mt-0.5">Rank approved suppliers by delivery, quality, category fit, and budget</p></div>
      {error && <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
        <form onSubmit={runSourcing} className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 shadow-xl space-y-4"><h3 className="font-bold text-white text-sm flex items-center"><Sparkles size={16} className="mr-2 text-cyan-400" /> Run sourcing recommendation</h3><label className="block"><span className="text-xs text-slate-400">Item</span><input required value={form.item} onChange={event => setForm(previous => ({ ...previous, item: event.target.value }))} placeholder="e.g. steel sheet" className="mt-1 w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500" /></label><label className="block"><span className="text-xs text-slate-400">Category</span><select value={form.category} onChange={event => setForm(previous => ({ ...previous, category: event.target.value }))} className="mt-1 w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"><option>Raw Materials</option><option>IT Hardware</option><option>Transport</option></select></label><label className="block"><span className="text-xs text-slate-400">Budget</span><input required type="number" value={form.budget} onChange={event => setForm(previous => ({ ...previous, budget: event.target.value }))} placeholder="500000" className="mt-1 w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500" /></label><button type="submit" disabled={running} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-center">{running ? <Loader2 size={14} className="animate-spin mr-2" /> : <Search size={14} className="mr-2" />} Find best supplier</button>{result && <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300"><strong>{result.request.recommended_vendor}</strong> is recommended with a {result.vendor?.score || 0}% composite score.</div>}</form>
        <div className="space-y-6"><div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl"><div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40"><h3 className="font-bold text-white text-sm">Supplier ranking</h3></div>{loading ? <div className="p-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></div> : <div className="divide-y divide-slate-800/60">{data.vendors.map(vendor => <div key={vendor.name} className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"><Users size={18} className="text-blue-400" /></div><div className="flex-1"><p className="font-bold text-white text-sm">{vendor.name}</p><p className="text-xs text-slate-400 mt-1">{vendor.category} · {vendor.delivery}% delivery · {vendor.quality}% quality</p></div><span className="text-cyan-400 font-bold text-sm">{vendor.score}%</span></div>)}</div>}</div><div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl"><div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40"><h3 className="font-bold text-white text-sm">Recent sourcing runs</h3></div><div className="divide-y divide-slate-800/60">{data.requests.map(request => <div key={request.id} className="p-5 flex justify-between items-center"><div><p className="text-sm font-bold text-white">{request.item}</p><p className="text-xs text-slate-400 mt-1">{request.category} · Budget INR {Number(request.budget).toLocaleString('en-IN')}</p></div><div className="text-right"><p className="text-xs text-emerald-400 font-semibold">{request.recommended_vendor}</p><p className="text-[10px] uppercase text-slate-500 mt-1">{request.status}</p></div></div>)}</div></div></div>
      </div>
    </div>
  );
}
