import React, { useRef, useState, useEffect } from 'react';
import { Upload, Bot, FileText, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

export default function AP() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
      const res = await fetch(`${baseUrl}/api/invoices`);
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
      const res = await fetch(`${baseUrl}/api/invoices/${id}/approve`, { method: 'POST' });
      const result = await res.json();
      
      // Optimistic update
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'approved' } : inv));
      setNotification(`Invoice ${id} approved & posted! Audit log generated.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('Failed to approve invoice:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSeniorReview = async (id) => {
    setProcessingId(id);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
      const res = await fetch(`${baseUrl}/api/invoices/${id}/review`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to route invoice to senior review');
      const updated = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      setNotification(`Invoice ${id} routed to Senior Review.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('Failed to route invoice:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const extractPdfValue = (pdfText, label) => {
    const match = pdfText.match(new RegExp(`\\(${label}:\\s*([^)]*)\\)\\s*Tj`));
    return match?.[1]?.replaceAll('\\\\(', '(').replaceAll('\\\\)', ')').trim() || '';
  };

  const parseInvoicePdf = async (file, index) => {
    const pdfBytes = await file.arrayBuffer();
    const pdfText = new TextDecoder('latin1').decode(pdfBytes);
    const pdfLines = [...pdfText.matchAll(/\(([^)]*)\)\s*Tj/g)].map(match => match[1]);
    const invoiceNumber = extractPdfValue(pdfText, 'Invoice Number');
    const vendor = extractPdfValue(pdfText, 'Supplier');
    const total = extractPdfValue(pdfText, 'Total');
    const purchaseOrder = extractPdfValue(pdfText, 'Purchase Order');
    const goodsReceipt = extractPdfValue(pdfText, 'Goods Receipt');
    const lineItem = pdfLines.find(line => /\s\d+(?:\.\d+)?\s+INR\s+[\d,]+\.\d{2}\s+INR\s+[\d,]+\.\d{2}/.test(line));
    const lineItemValues = lineItem?.match(/\s(\d+(?:\.\d+)?)\s+INR\s+([\d,]+\.\d{2})\s+INR\s+[\d,]+\.\d{2}/);
    const quantity = lineItemValues ? Number(lineItemValues[1]) : NaN;
    const unitPrice = lineItemValues ? Number(lineItemValues[2].replaceAll(',', '')) : NaN;

    if (!invoiceNumber || !vendor || !total || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
      return {
        id: `UPLOAD-${Date.now()}-${index + 1}`,
        vendor: file.name,
        amount: 'Awaiting extraction',
        tier: 3,
        score: 0,
        reasoning: 'PDF received, but readable invoice fields or line-item pricing were not found. Use a text-based PDF rather than an image-only scan.',
        status: 'pending'
      };
    }

    const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
    const matchResponse = await fetch(`${baseUrl}/api/invoices/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceNumber,
        vendor,
        total: Number(total.replace(/[^\d.]/g, '')),
        quantity,
        unitPrice,
        purchaseOrder,
        goodsReceipt
      })
    });

    if (!matchResponse.ok) {
      throw new Error(`Three-way match failed for ${file.name}`);
    }

    const matchResult = await matchResponse.json();

    return {
      id: invoiceNumber,
      vendor,
      amount: total,
      tier: matchResult.tier,
      score: matchResult.score,
      reasoning: matchResult.reasoning,
      status: matchResult.tier === 1 ? 'approved' : 'pending'
    };
  };

  const handleBatchUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (files.length === 0) return;

    const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    const rejectedCount = files.length - pdfFiles.length;
    const uploadedInvoices = await Promise.all(pdfFiles.map(parseInvoicePdf));

    if (uploadedInvoices.length > 0) {
      setInvoices(previousInvoices => [...uploadedInvoices, ...previousInvoices]);
    }

    if (rejectedCount > 0) {
      setNotification(`${uploadedInvoices.length} PDF${uploadedInvoices.length === 1 ? '' : 's'} processed. ${rejectedCount} non-PDF file${rejectedCount === 1 ? '' : 's'} skipped.`);
    } else {
      setNotification(`${uploadedInvoices.length} PDF${uploadedInvoices.length === 1 ? '' : 's'} processed and added to the queue.`);
    }
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Intelligent AP & Invoicing</h2>
          <p className="text-slate-400 text-xs mt-0.5">Autonomous 3-way matching engine powered by Tiered AI Routing</p>
        </div>
        <input
          ref={uploadInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleBatchUpload}
          className="hidden"
          aria-label="Select invoice PDF files"
        />
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center transition-all"
        >
          <Upload size={15} className="mr-2" /> Upload Batch PDF
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="flex items-center">
            <CheckCircle size={15} className="mr-2 text-emerald-400" />
            {notification}
          </span>
        </div>
      )}

      {/* Joule Assistant Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/60 p-5 backdrop-blur-xl border border-blue-500/20 shadow-lg flex items-start space-x-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
          <Bot size={22} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white">Autonomous AP Verification Active</h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
              3-Way Match
            </span>
          </div>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Invoices are verified against PO lines and Goods Receipts (GRN). Exact matches ≥90% confidence are posted autonomously (Tier 1). Minor variances (Tier 2) are staged below for one-click operator verification.
          </p>
        </div>
      </div>

      {/* Invoice Queue Container */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-white text-sm">Processing Queue</h3>
            <span className="text-xs text-slate-400">({invoices.length} transactions)</span>
          </div>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
            {invoices.filter(i => i.status === 'pending').length} Action Required
          </span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin text-blue-400" />
            <span className="text-xs">Synchronizing invoices from SQLite database...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-6 flex flex-col lg:flex-row gap-6 hover:bg-slate-800/30 transition-all duration-200">
                
                {/* Left col: Invoice details */}
                <div className="lg:w-1/4">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <FileText className="text-slate-400" size={18} />
                    <span className="font-bold text-white text-sm">{inv.id}</span>
                  </div>
                  <p className="text-xs text-slate-400">{inv.vendor}</p>
                  <p className="text-lg font-extrabold text-white mt-2 tracking-tight">{inv.amount}</p>
                </div>
                
                {/* Middle col: Reasoning & Tiers */}
                <div className="lg:w-1/2">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      inv.tier === 1 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                      inv.tier === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      Tier {inv.tier} • {inv.score}% Match Score
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {inv.tier === 1 ? 'Auto-Posting' : inv.tier === 2 ? 'Assisted Review' : 'Exception Handling'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    <span className="font-bold text-blue-400">Autonomous Reasoning:</span> {inv.reasoning}
                  </div>
                </div>
                
                {/* Right col: Action Buttons */}
                <div className="lg:w-1/4 flex flex-col justify-center space-y-2">
                  {inv.status === 'approved' ? (
                     <div className="text-center text-xs text-emerald-400 font-semibold p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                       <CheckCircle size={14} className="mr-1.5" /> Approved & Posted
                     </div>
                  ) : inv.tier === 2 ? (
                    <>
                      <button 
                        onClick={() => handleApprove(inv.id)} 
                        disabled={processingId === inv.id}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                      >
                        {processingId === inv.id ? (
                          <Loader2 size={14} className="animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle size={14} className="mr-1.5" />
                        )}
                        Approve & Post
                      </button>
                      <button onClick={() => handleSeniorReview(inv.id)} disabled={processingId === inv.id} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-center transition-all disabled:opacity-50">
                        <AlertTriangle size={13} className="mr-1.5 text-amber-400" /> Route to Senior Review
                      </button>
                    </>
                  ) : inv.tier === 1 ? (
                    <div className="text-center text-xs text-cyan-400 font-medium p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                      ⚡ Auto-Posted (Tier 1 Execution)
                    </div>
                  ) : (
                    <div className="text-center text-xs text-rose-400 font-medium p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      ⛔ Human Exception Required (Tier 3)
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
