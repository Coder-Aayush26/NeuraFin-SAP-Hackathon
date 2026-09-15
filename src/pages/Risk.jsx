import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldCheck, TrendingUp, Loader2, ArrowUpRight, ExternalLink } from 'lucide-react';

export default function Risk() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
      const res = await fetch(`${baseUrl}/api/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Supplier Risk Monitoring</h2>
          <p className="text-slate-400 text-xs mt-0.5">Continuous automated supplier performance and risk concentration scoring</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Active Watch: 3 Monitored Categories</span>
        </div>
      </div>
      
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Loader2 size={24} className="animate-spin text-blue-400" />
          <span className="text-xs">Synchronizing vendor risk indices...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vendors.map((vendor, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-base text-white">{vendor.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{vendor.category}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                    vendor.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    vendor.risk === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {vendor.risk} Risk
                  </span>
                </div>
                
                {/* Metrics */}
                <div className="space-y-4 my-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">On-Time Delivery SLA</span>
                      <span className="font-bold text-white">{vendor.delivery}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          vendor.delivery >= 90 ? 'bg-emerald-400' :
                          vendor.delivery >= 75 ? 'bg-amber-400' :
                          'bg-rose-400'
                        }`} 
                        style={{ width: `${vendor.delivery}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Quality Acceptance Rate</span>
                      <span className="font-bold text-white">{vendor.quality}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          vendor.quality >= 90 ? 'bg-emerald-400' :
                          vendor.quality >= 75 ? 'bg-amber-400' :
                          'bg-rose-400'
                        }`} 
                        style={{ width: `${vendor.quality}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                 <span className="text-slate-400">
                   Routing: <strong className="text-slate-200">{vendor.status}</strong>
                 </span>
                 <button type="button" onClick={() => setSelectedVendor(vendor)} className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center transition-colors">
                   Inspect Profile <ArrowUpRight size={13} className="ml-1" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maverick Spend & Concentration Warning */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>

          {selectedVendor && (
            <div className="rounded-2xl bg-slate-900/80 border border-blue-500/30 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-blue-400 font-bold">Supplier profile</p>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedVendor.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedVendor.category} · Current routing: {selectedVendor.status}</p>
                </div>
                <button type="button" onClick={() => setSelectedVendor(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-xs">
                <div><p className="text-slate-500">Delivery</p><p className="text-white font-bold mt-1">{selectedVendor.delivery}%</p></div>
                <div><p className="text-slate-500">Quality</p><p className="text-white font-bold mt-1">{selectedVendor.quality}%</p></div>
                <div><p className="text-slate-500">Risk</p><p className="text-white font-bold mt-1">{selectedVendor.risk}</p></div>
                <div><p className="text-slate-500">Recommended action</p><p className="text-white font-bold mt-1">{selectedVendor.risk === 'High' ? 'Senior review' : 'Continue monitoring'}</p></div>
              </div>
            </div>
          )}
            <h4 className="text-sm font-bold text-white">AI-Guided Sourcing Guardrails Active</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Requisitions automatically route to pre-approved contract vendors. Maverick spend attempts trigger proactive alerts to budget holders.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setSelectedVendor(vendors.reduce((highest, vendor) => vendor.risk === 'High' ? vendor : highest, vendors[0]))} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0">
          View Concentration Index
        </button>
      </div>

    </div>
  );
}
