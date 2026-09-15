import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Loader2, Plus, Send, UserRound } from 'lucide-react';
import { api } from '../lib/api';

const initialForm = { requester: '', description: '', category: 'Raw Materials', amount: '' };

export default function Req() {
  const [requisitions, setRequisitions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRequisitions = async () => {
    setLoading(true);
    try { setRequisitions(await api('/api/requisitions')); setError(''); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  useEffect(() => { loadRequisitions(); }, []);

  const createRequisition = async event => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const created = await api('/api/requisitions', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setRequisitions(previous => [created, ...previous]);
      setForm(initialForm);
      setMessage(`${created.id} created and routed for review.`);
      setError('');
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };

  const approve = async id => {
    setProcessingId(id);
    try { const updated = await api(`/api/requisitions/${id}/approve`, { method: 'POST' }); setRequisitions(previous => previous.map(item => item.id === id ? updated : item)); } catch (requestError) { setError(requestError.message); } finally { setProcessingId(null); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div><h2 className="text-2xl font-bold text-white tracking-tight">Requisition to PO</h2><p className="text-slate-400 text-xs mt-0.5">Capture demand, route to an approved vendor, and convert reviewed requests into purchase orders</p></div>
      {(error || message) && <div className={`p-3 rounded-xl text-xs border ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>{error || message}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
        <form onSubmit={createRequisition} className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center"><Plus size={16} className="mr-2 text-blue-400" /> Create requisition</h3>
          {[['requester', 'Requester', 'Aayush P.'], ['description', 'What is needed', 'e.g. steel sheet'], ['amount', 'Estimated amount', '500000']].map(([name, label, placeholder]) => <label key={name} className="block"><span className="text-xs text-slate-400">{label}</span><input required name={name} type={name === 'amount' ? 'number' : 'text'} value={form[name]} onChange={event => setForm(previous => ({ ...previous, [name]: event.target.value }))} placeholder={placeholder} className="mt-1 w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500" /></label>)}
          <label className="block"><span className="text-xs text-slate-400">Category</span><select value={form.category} onChange={event => setForm(previous => ({ ...previous, category: event.target.value }))} className="mt-1 w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"><option>Raw Materials</option><option>IT Hardware</option><option>Transport</option></select></label>
          <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-center">{submitting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2" />} Submit for review</button>
        </form>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl"><div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40"><h3 className="font-bold text-white text-sm">Requisition worklist</h3></div>{loading ? <div className="p-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></div> : <div className="divide-y divide-slate-800/60">{requisitions.map(item => <div key={item.id} className="p-5"><div className="flex justify-between gap-4"><div><p className="font-bold text-white text-sm">{item.description}</p><p className="text-xs text-slate-400 mt-1 flex items-center"><UserRound size={12} className="mr-1" /> {item.requester} · {item.id}</p></div><span className={`text-[10px] uppercase font-bold px-2 py-1 h-fit rounded-full border ${item.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>{item.status}</span></div><div className="flex items-center justify-between mt-4 text-xs"><span className="text-slate-400">{item.category} · INR {Number(item.amount).toLocaleString('en-IN')} · {item.vendor}</span>{item.status !== 'approved' ? <button type="button" onClick={() => approve(item.id)} disabled={processingId === item.id} className="text-blue-400 hover:text-blue-300 font-semibold flex items-center">{processingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} className="mr-1" />} Approve & create PO</button> : <span className="text-emerald-400 flex items-center"><ClipboardList size={13} className="mr-1" /> PO created</span>}</div></div>)}</div>}</div>
      </div>
    </div>
  );
}
