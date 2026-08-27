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
    <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-gray-200">
      
      {/* Premium Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        
        {/* Top Header Section */}
        <div className="px-8 py-12 sm:px-16 sm:py-16 text-center flex flex-col items-center relative border-b border-gray-100/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>
          
          <img 
            src="https://sih.gov.in/img1/SIH2026-logo.png" 
            alt="SIH 2026 Logo" 
            className="h-12 sm:h-16 w-auto max-w-full mb-8 object-contain drop-shadow-sm"
          />
          
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
             <ShieldCheck className="w-8 h-8 text-emerald-600" />
             <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">
               HONEYCHAIN
             </h1>
          </div>
          
          <p className="text-emerald-700 text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100 shadow-sm">
            Blockchain-Verified Traceability
          </p>
        </div>
        
        {/* Main Content Section */}
        <div className="px-8 py-12 sm:px-16 sm:py-16 text-center space-y-10 bg-gradient-to-b from-white/50 to-transparent">
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Discover the exact origin, quality, and journey of your honey. 
            Every step is cryptographically secured on the Polygon blockchain to guarantee total authenticity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-2xl mx-auto w-full">
            <div className="relative w-full group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500 group-focus-within:opacity-100 group-focus-within:from-blue-400 group-focus-within:to-emerald-400"></div>
              <div className="relative flex items-center w-full">
                 <Search className="absolute left-5 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                 <input 
                   type="text" 
                   value={qrCode}
                   onChange={(e) => setQrCode(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                   placeholder="Enter QR Identifier (e.g., QR-2026-000001)" 
                   className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-xl focus:ring-0 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 font-semibold shadow-sm text-lg"
                 />
              </div>
            </div>
            
            <button 
              onClick={handleVerify}
              disabled={!qrCode.trim()}
              className="group bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center w-full sm:w-auto transition-all shadow-md hover:shadow-lg active:scale-95 border border-transparent"
            >
              Verify
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50/80 backdrop-blur-md p-6 text-center border-t border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center">
             A Smart India Hackathon 2026 Initiative <span className="mx-2">•</span> Powered by Web3
           </p>
        </div>
      </div>
    </main>
  );
}
