import React from 'react';
import { LayoutDashboard, Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default function Placeholder() {
  const location = useLocation();
  const path = location.pathname.substring(1);
  
  const moduleNames = {
    cash: 'AI-Assisted Cash Application',
    recon: 'Continuous Reconciliation & Close',
    req: 'Requisition-to-PO Automation',
    sourcing: 'AI-Guided Autonomous Sourcing'
  };

  const moduleDescriptions = {
    cash: 'Automates payment remittance matching against open AR line items, handling lockbox feeds and unstructured remittance advices with fuzzy matching.',
    recon: 'Performs subledger-to-general-ledger automated continuous balancing, shrinking the standard 8-day financial close to 1.2 days.',
    req: 'Converts unstructured employee requisitions into compliant purchase orders, enforcing pre-negotiated catalogs to suppress maverick spend below 8%.',
    sourcing: 'Dynamically routes purchase requests to top-ranked contracted vendors based on real-time delivery performance and price variance analytics.'
  };

  const title = moduleNames[path] || (path.charAt(0).toUpperCase() + path.slice(1) + ' Module');
  const description = moduleDescriptions[path] || 'This enterprise capability is part of the NeuraFin autonomous architecture.';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500 py-12 px-4">
      <div className="max-w-xl w-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Cpu size={32} />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
          <Sparkles size={12} />
          <span>Autonomous Architecture Spec</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">
          {title}
        </h2>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {description}
        </p>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 mb-6 text-left">
          <span className="font-bold text-slate-200 block mb-1">Architecture Roadmap:</span>
          Full workflow connects to the central tiered decision engine (Tier 1 straight-through, Tier 2 assisted review, Tier 3 human intervention).
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Return to Command Center <ArrowRight size={14} className="ml-2" />
          </Link>
          <Link 
            to="/ap" 
            className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-all"
          >
            Explore Intelligent AP
          </Link>
        </div>

      </div>
    </div>
  );
}
