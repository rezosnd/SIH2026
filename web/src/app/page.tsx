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
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 relative z-10">
        <div className="p-12 text-center flex flex-col items-center border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
          <img 
            src="https://sih.gov.in/img1/SIH2026-logo.png" 
            alt="SIH 2026 Logo" 
            className="h-24 mb-6 object-contain"
          />
          <div className="flex items-center space-x-3 mb-4">
             <ShieldCheck className="w-8 h-8 text-blue-600" />
             <h1 className="text-4xl font-black text-gray-900 tracking-tight">HoneyChain</h1>
          </div>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
            Blockchain-Verified Traceability
          </p>
        </div>
        
        <div className="p-16 text-center space-y-10">
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Discover the exact origin, quality, and journey of your honey. 
            Every step is cryptographically secured on the blockchain to guarantee total authenticity and transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter QR Identifier (e.g., QR-2026-000001)" 
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400 font-semibold shadow-sm text-lg"
              />
            </div>
            <button 
              onClick={handleVerify}
              disabled={!qrCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center w-full sm:w-auto transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Verify
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
             A Smart India Hackathon 2026 Initiative • Powered by Web3
           </p>
        </div>
      </div>
    </main>
  );
}
