import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  RefreshCw,
  ShoppingCart,
  Users,
  AlertOctagon,
  ShieldCheck,
  Bell,
  Search,
  Menu,
  Sparkles,
  Database
} from 'lucide-react';
import JouleChatbot from './JouleChatbot';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { id: '/', label: 'Command Center', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Autonomous Finance',
      items: [
        { id: '/ap', label: 'Intelligent AP', icon: FileText },
        { id: '/cash', label: 'Cash Application', icon: CreditCard },
        { id: '/recon', label: 'Reconciliation', icon: RefreshCw }
      ]
    },
    {
      title: 'Autonomous Procurement',
      items: [
        { id: '/req', label: 'Requisition to PO', icon: ShoppingCart },
        { id: '/sourcing', label: 'AI Sourcing', icon: Users },
        { id: '/risk', label: 'Supplier Risk', icon: AlertOctagon }
      ]
    },
    {
      title: 'Trust & Control',
      items: [
        { id: '/governance', label: 'AI Governance', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 text-slate-300 transition-all duration-300 flex flex-col z-30 shrink-0 shadow-2xl`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white rounded-xl flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/25 shrink-0">
              N
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-tight text-lg leading-tight flex items-center">
                  NeuraFin
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                    v2.0
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">Autonomous Enterprise</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="px-3">
              {sidebarOpen && (
                <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map(item => (
                  <li key={item.id}>
                    <NavLink 
                      to={item.id}
                      className={({isActive}) => `w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/30' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <item.icon size={19} className="shrink-0 transition-transform group-hover:scale-110" />
                      {sidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Engine status footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-300">SQLite Engine Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for Standalone / Render</p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        
        {/* Top Navbar with Glassmorphism */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center bg-slate-800/70 border border-slate-700/60 rounded-xl px-3.5 py-1.5 w-72 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search size={15} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search POs, invoices, suppliers..." 
                className="bg-transparent border-none outline-none ml-2.5 text-xs text-slate-200 placeholder-slate-400 w-full" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
              <Sparkles size={13} className="mr-1.5 text-blue-400" />
              Autonomous Mode: 62%
            </div>

            <button className="text-slate-400 hover:text-white relative p-2 rounded-xl hover:bg-slate-800 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900"></span>
            </button>

            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
                AP
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">Aayush P.</span>
                <span className="text-[10px] text-slate-400">Finance Controller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950/40 relative">
          {/* Subtle glowing mesh accents */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>

        <JouleChatbot />
      </div>
    </div>
  );
}
