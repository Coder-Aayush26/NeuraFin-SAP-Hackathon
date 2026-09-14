import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, ArrowRight, Loader2, Sparkles, MessageSquare } from 'lucide-react';

export default function JouleChatbot() {
  const [jouleOpen, setJouleOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm Joule, your NeuraFin Autonomous Enterprise Copilot. I'm actively monitoring 3-way matching, variance thresholds, supplier risk scores, and maverick spend. Ask me anything or select a prompt below." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "Explain variance on INV-4471",
    "What is our maverick spend rate?",
    "Check supplier risk for Rapid Logistics",
    "How does continuous reconciliation work?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (jouleOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, jouleOpen]);

  const handleSend = async (text) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Autonomous Joule service is currently processing offline queue. Please verify backend connectivity.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Joule Button */}
      <button 
        onClick={() => setJouleOpen(!jouleOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 z-50 border ${
          jouleOpen 
            ? 'bg-slate-800 text-white border-slate-700' 
            : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white border-blue-400/40 shadow-blue-500/30'
        }`}
        aria-label="Toggle Joule Copilot"
      >
        {jouleOpen ? <X size={22} /> : (
          <div className="relative">
            <Bot size={26} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-blue-600"></span>
          </div>
        )}
      </button>

      {/* Joule Chat Panel */}
      {jouleOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[420px] h-[560px] bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-4 px-5 flex items-center justify-between border-b border-white/10">
             <div className="flex items-center space-x-3">
               <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                 <Bot size={20} />
               </div>
               <div>
                 <div className="flex items-center space-x-1.5">
                   <span className="font-bold text-sm tracking-tight">Joule AI Copilot</span>
                   <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                     Live
                   </span>
                 </div>
                 <span className="text-[10px] text-blue-200">Autonomous Enterprise Engine</span>
               </div>
             </div>
             <button 
               onClick={() => setJouleOpen(false)}
               className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
             >
               <X size={18} />
             </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`p-3.5 rounded-2xl shadow-md max-w-[85%] leading-relaxed ${
                   msg.role === 'user' 
                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none' 
                     : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none'
                 }`}>
                   {msg.content}
                 </div>
               </div>
             ))}
             
             {isLoading && (
               <div className="flex justify-start">
                 <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-slate-300 flex items-center space-x-2">
                   <Loader2 size={14} className="animate-spin text-cyan-400" />
                   <span className="text-xs">Reasoning with NeuraFin data...</span>
                 </div>
               </div>
             )}
             
             <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <Sparkles size={13} className="text-blue-400 shrink-0" />
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap text-[10px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 px-2.5 py-1 rounded-full transition-all shrink-0 hover:border-blue-400/50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80">
            <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 focus-within:border-blue-500 transition-all">
              <input 
                type="text" 
                placeholder="Ask Joule about AP, POs, risk, or reconciliations..." 
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-400 w-full" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={() => handleSend(input)} 
                className="w-7 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center ml-2 shrink-0 transition-colors disabled:opacity-40" 
                disabled={isLoading || !input.trim()}
              >
                <ArrowRight size={14}/>
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
