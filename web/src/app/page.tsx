"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Search } from 'lucide-react';

export default function Home() {
  const [qrCode, setQrCode] = useState('');
  const router = useRouter();

  const handleVerify = () => {
    if (qrCode.trim()) {
      // Assuming QR format is HNY-2026-0001 or similar, we'll extract or use it
      // For this demo, let's just pass it as containerId. In a real scenario, the QR contains the full URL or a unique ID.
      // Usually, the QR code is scanned and takes them directly to /verify/[batchId]/[containerId]
      // If they type it manually, we navigate them.
      router.push(`/verify/batch/${qrCode.trim()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gray-900 p-12 text-center border-b border-gray-800">
          <ShieldCheck className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-3 tracking-widest uppercase">HoneyChain</h1>
          <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Blockchain-verified honey traceability.</p>
        </div>
        
        <div className="p-12 text-center space-y-8">
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Verify the exact origin, quality, and processing journey of your honey. Every step is cryptographically secured on the blockchain to guarantee authenticity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter QR Identifier..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none text-gray-900 placeholder-gray-500 font-medium"
              />
            </div>
            <button 
              onClick={handleVerify}
              disabled={!qrCode.trim()}
              className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center w-full sm:w-auto transition-colors"
            >
              Verify Product
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
          
          <div className="pt-10 mt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Powered by KVIC & Web3 Infrastructure
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
