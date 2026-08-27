"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [qrCode, setQrCode] = useState('');
  const router = useRouter();

  const handleVerify = () => {
    if (qrCode.trim()) {
      router.push(`/verify/batch/${qrCode.trim()}`);
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-[#fafafa] flex flex-col items-center justify-center p-4 font-sans overflow-hidden selection:bg-gray-200">
      
      {/* Subtle Grid Background (Monochrome) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:32px_32px] opacity-60"></div>

      {/* Main Container - strictly fitted */}
      <div className="max-w-3xl w-full max-h-full bg-white rounded-2xl shadow-sm border border-gray-200 relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top Header Section */}
        <div className="px-6 pt-10 pb-6 flex flex-col items-center border-b border-gray-100 flex-shrink-0">
          <img 
            src="https://sih.gov.in/img1/SIH2026-logo.png" 
            alt="SIH 2026 Logo" 
            className="h-10 sm:h-12 w-auto max-w-full mb-6 object-contain"
          />
          
          <div className="flex items-center space-x-2 mb-4">
             <ShieldCheck className="w-6 h-6 text-black" />
             <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
               HONEYCHAIN
             </h1>
          </div>
          
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase bg-gray-100 px-4 py-1.5 rounded-md border border-gray-200">
            Blockchain-Verified Traceability
          </p>
        </div>
        
        {/* Main Content Section */}
        <div className="px-6 py-8 flex flex-col items-center justify-center flex-1 min-h-0 bg-white">
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto text-center leading-relaxed font-medium mb-8">
            Discover the exact origin, quality, and journey of your honey. 
            Every step is cryptographically secured on the Polygon blockchain to guarantee total authenticity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors focus-within:text-black" />
              <input 
                type="text" 
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter QR Identifier..." 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none text-gray-900 placeholder-gray-400 font-semibold text-base"
              />
            </div>
            
            <button 
              onClick={handleVerify}
              disabled={!qrCode.trim()}
              className="group bg-black hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-lg font-bold flex items-center justify-center w-full sm:w-auto transition-all active:scale-95 flex-shrink-0"
            >
              Verify
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Portal Links */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Role-Based Portals</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <a href="/admin" className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-1.5 rounded-full transition-colors">Admin</a>
            <a href="/kvic/dashboard" className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-1.5 rounded-full transition-colors">KVIC</a>
            <a href="/processor" className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-1.5 rounded-full transition-colors">Processor</a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100 flex-shrink-0">
           <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center">
             A Smart India Hackathon 2026 Initiative <span className="mx-1.5">•</span> Powered by Web3
           </p>
        </div>
      </div>
    </main>
  );
}
