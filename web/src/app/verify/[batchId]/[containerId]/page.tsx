"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, MapPin, CheckCircle2, ChevronRight, Hash } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function VerificationPage() {
  const params = useParams();
  const containerId = params.containerId as string;

  const [status, setStatus] = useState<'LOADING' | 'VERIFIED' | 'SUSPICIOUS' | 'INVALID'>('LOADING');
  const [data, setData] = useState<any>(null);
  const [riskReason, setRiskReason] = useState<string | null>(null);

  useEffect(() => {
    async function recordScan() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/qr/${containerId}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        
        if (!res.ok) {
           setStatus('INVALID');
           return;
        }

        const scanResult = await res.json();
        
        const passportRes = await fetch(`${apiUrl}/batches/verify/${containerId}`);
        if (!passportRes.ok) {
           setStatus('INVALID');
           return;
        }
        const passportData = await passportRes.json();
        
        setData(passportData);
        setStatus(scanResult.status);
        if (scanResult.status === 'SUSPICIOUS') {
           setRiskReason('Unrealistic scanning pattern detected.');
        }
        
      } catch (err) {
        setStatus('INVALID');
      }
    }
    
    recordScan();
  }, [containerId]);

  if (status === 'LOADING') {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#f2f2f7]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const isVerified = status === 'VERIFIED';
  const isSuspicious = status === 'SUSPICIOUS';
  
  return (
    <main className="h-[100dvh] bg-[#f2f2f7] flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Wallet Pass Container - Fits in one screen */}
      <div className="w-full max-w-sm h-full max-h-[750px] relative drop-shadow-2xl flex flex-col">
        
        {/* Pass Header & Main Body (Blue/Red Section) */}
        <div className={`rounded-t-3xl flex-shrink-0 flex flex-col relative ${isSuspicious ? 'bg-[#c62828]' : status === 'INVALID' ? 'bg-gray-800' : 'bg-[#007aff]'}`}>
           
           {/* Top Header */}
           <div className="px-5 pt-6 pb-2 flex justify-between items-start">
              <div className="flex flex-col">
                 <img src="https://sih.gov.in/img1/SIH2026-logo.png" alt="SIH" className="h-6 w-auto brightness-0 invert opacity-90 mb-1" />
                 <h1 className="text-white font-black text-xl tracking-tight">HoneyChain</h1>
              </div>
              <div className="text-right flex flex-col items-end">
                 <p className="text-white/80 text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full mb-1">Status</p>
                 <p className="text-[#ffcc00] font-black text-2xl leading-none">{status}</p>
              </div>
           </div>

           {/* Location Info */}
           <div className="px-6 py-4 border-t border-white/10 mt-3 flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                 <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-0.5">Source Apiary</p>
                 <p className="text-white font-bold text-xl truncate">{data?.hive?.location || 'Unknown'}</p>
              </div>
           </div>

           {/* Stats Row */}
           <div className="px-6 pb-5 pt-2 flex justify-between">
              <div>
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-0.5">Harvested</p>
                 <p className="text-[#ffcc00] font-bold text-base">{data?.harvestDate ? new Date(data.harvestDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '--'}</p>
              </div>
              <div className="text-center">
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-0.5">Quality</p>
                 <p className="text-[#ffcc00] font-bold text-base">{isVerified ? 'PASSED' : 'FAIL'}</p>
              </div>
              <div className="text-right">
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-0.5">Batch</p>
                 <p className="text-[#ffcc00] font-bold text-base font-mono">{data?.id?.substring(0,6).toUpperCase() || '--'}</p>
              </div>
           </div>
           
           {/* Message */}
           <div className="px-6 pb-6 text-center">
             <div className="inline-flex items-center justify-center bg-black/20 rounded-lg px-4 py-2 w-full">
               {isVerified ? <ShieldCheck className="w-4 h-4 text-white mr-2" /> : isSuspicious ? <AlertTriangle className="w-4 h-4 text-white mr-2" /> : <XCircle className="w-4 h-4 text-white mr-2" />}
               <p className="text-white text-sm font-semibold truncate">{isSuspicious ? riskReason : isVerified ? 'Verified Authentic Product' : 'Invalid Code'}</p>
             </div>
           </div>
        </div>

        {/* Cutout Separator */}
        <div className="relative h-6 -my-3 z-10 flex items-center flex-shrink-0">
           <div className={`absolute left-0 w-6 h-6 -ml-3 rounded-full bg-[#f2f2f7]`}></div>
           <div className="w-full border-t-2 border-dashed border-gray-400 opacity-40"></div>
           <div className={`absolute right-0 w-6 h-6 -mr-3 rounded-full bg-[#f2f2f7]`}></div>
        </div>

        {/* Bottom Section (Scrollable if needed, but designed to fit) */}
        <div className="bg-white rounded-b-3xl px-6 pt-6 pb-6 flex-1 flex flex-col shadow-inner border-t-0 overflow-y-auto">
           
           {/* Timeline / Trace */}
           {data?.events && (
             <div className="w-full flex-1 mb-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Blockchain Trace</p>
               <div className="space-y-3">
                 {data.events.slice(-3).map((evt: any, idx: number) => (
                   <div key={idx} className="flex items-start text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                     <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-gray-900 text-xs truncate">{evt.eventType}</p>
                       <p className="text-[10px] text-gray-500">{new Date(evt.timestamp).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Tx Hash */}
           {data?.txHash && (
             <div className="w-full mt-auto bg-gray-900 rounded-xl p-3 flex flex-col items-center">
                <div className="flex items-center text-white/50 mb-1">
                   <Hash className="w-3 h-3 mr-1" />
                   <p className="text-[9px] font-black uppercase tracking-widest">Polygon EVM Tx</p>
                </div>
                <p className="text-[10px] font-mono text-gray-300 break-all text-center leading-tight mb-2 px-2">{data.txHash}</p>
                <a href={`https://amoy.polygonscan.com/tx/${data.txHash}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-white bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center">
                  Verify Explorer <ChevronRight className="w-3 h-3 ml-1" />
                </a>
             </div>
           )}
           
        </div>
      </div>
    </main>
  );
}
