import React from 'react';
import { GraduationCap, ShieldCheck, Zap, Globe } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

export function Landing({ onLogin }: LandingProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-stone-800 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-stone-900 blur-[120px]" />
      </div>

      <header className="relative z-10 p-8 flex items-center justify-between container mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-stone-950">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tighter uppercase">EduFee Pro</span>
        </div>
        <button 
          onClick={onLogin}
          className="px-6 py-3 bg-white text-stone-950 rounded-full font-bold hover:scale-105 transition-transform active:scale-95"
        >
          Sign In
        </button>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[0.9]">
          AUTOMATE<br />
          <span className="text-stone-500">YOUR SCHOOL</span><br />
          FINANCES
        </h1>
        <p className="text-stone-400 max-w-xl text-lg mb-12">
          The all-in-one SaaS platform for automated invoicing, multi-tenant school management, and instant fee receipts via WhatsApp.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-16">
          <div className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <Zap className="w-10 h-10 mb-4 text-stone-200" />
            <h3 className="text-xl font-bold mb-2">Auto-Invoicing</h3>
            <p className="text-sm text-stone-500">Scheduled monthly invoice generation with zero manual effort.</p>
          </div>
          <div className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <ShieldCheck className="w-10 h-10 mb-4 text-stone-200" />
            <h3 className="text-xl font-bold mb-2">WhatsApp Sync</h3>
            <p className="text-sm text-stone-500">Deliver bills and receipts directly to parents' phones instantly.</p>
          </div>
          <div className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <Globe className="w-10 h-10 mb-4 text-stone-200" />
            <h3 className="text-xl font-bold mb-2">Multi-Tenant</h3>
            <p className="text-sm text-stone-500">Scale globally. One platform, unlimited isolated schools.</p>
          </div>
        </div>

        <button 
          onClick={onLogin}
          className="group relative px-10 py-5 bg-stone-100 text-stone-950 rounded-2xl font-black text-xl hover:bg-white transition-all shadow-2xl shadow-white/10"
        >
          START NOW
          <div className="absolute inset-0 rounded-2xl border-2 border-white scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all pointer-events-none" />
        </button>
      </main>

      <footer className="relative z-10 p-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 container mx-auto">
        <p className="text-stone-600 text-sm font-mono">&copy; 2026 EDUFEE PRO SYSTEMS</p>
        <div className="flex gap-8 text-stone-600 text-[10px] uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-white">Security</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
