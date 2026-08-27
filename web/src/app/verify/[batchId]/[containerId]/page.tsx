"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, MapPin, Calendar, CheckCircle2, QrCode } from 'lucide-react';
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
           setRiskReason('Unrealistic geographic movement or excessive scanning identified.');
        }
        
      } catch (err) {
        setStatus('INVALID');
      }
    }
    
    recordScan();
  }, [containerId]);

  if (status === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const isVerified = status === 'VERIFIED';
  const isSuspicious = status === 'SUSPICIOUS';
  
  return (
    <main className="min-h-screen bg-[#f2f2f7] flex flex-col items-center pt-8 pb-12 px-4 font-sans sm:px-6">
      
      {/* Wallet Pass Container */}
      <div className="w-full max-w-md relative drop-shadow-2xl filter">
        
        {/* Pass Header & Main Body */}
        <div className={`rounded-t-3xl overflow-hidden relative ${isSuspicious ? 'bg-[#c62828]' : status === 'INVALID' ? 'bg-gray-800' : 'bg-[#007aff]'}`}>
           
           {/* Top Header */}
           <div className="px-6 pt-6 pb-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                 <img src="https://sih.gov.in/img1/SIH2026-logo.png" alt="SIH" className="h-8 brightness-0 invert opacity-90" />
                 <h1 className="text-white font-bold text-lg tracking-wide">HoneyChain</h1>
              </div>
              <div className="text-right">
                 <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Status</p>
                 <p className="text-[#ffcc00] font-bold text-xl leading-none">{status}</p>
              </div>
           </div>

           {/* Route / Origin -> Destination equivalent */}
           <div className="px-6 py-6 border-t border-white/10 mt-2">
              <div className="flex justify-between items-center">
                 <div className="w-2/5">
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">Origin</p>
                    <p className="text-[#ffcc00] font-bold text-4xl truncate" title={data?.hive?.location}>
                       {data?.hive?.location?.substring(0, 3).toUpperCase() || 'UNK'}
                    </p>
                 </div>
                 
                 <div className="w-1/5 flex justify-center text-white/50">
                    <MapPin className="w-8 h-8" />
                 </div>
                 
                 <div className="w-2/5 text-right">
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">Destination</p>
                    <p className="text-[#ffcc00] font-bold text-4xl">YOU</p>
                 </div>
              </div>
           </div>

           {/* Flight Details equivalent */}
           <div className="px-6 pb-6">
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                 <div>
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">Harvested</p>
                    <p className="text-[#ffcc00] font-medium text-lg">{data?.harvestDate ? new Date(data.harvestDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '--'}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">Quality</p>
                    <p className="text-[#ffcc00] font-medium text-lg">{isVerified ? 'PASSED' : 'FAIL'}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">Batch ID</p>
                    <p className="text-[#ffcc00] font-medium text-lg truncate w-16">{data?.id?.substring(0,6).toUpperCase() || '--'}</p>
                 </div>
              </div>
           </div>
           
           {/* Passenger Name equivalent */}
           <div className="px-6 pb-8">
             <p className="text-white text-lg font-medium">{isSuspicious ? riskReason : isVerified ? 'Cryptographically Verified Authentic Honey' : 'Invalid QR Code'}</p>
           </div>
        </div>

        {/* Cutout Separator */}
        <div className="relative h-8 -my-4 z-10 flex items-center">
           <div className={`absolute left-0 w-8 h-8 -ml-4 rounded-full bg-[#f2f2f7]`}></div>
           <div className="w-full border-t-2 border-dashed border-gray-400 opacity-40"></div>
           <div className={`absolute right-0 w-8 h-8 -mr-4 rounded-full bg-[#f2f2f7]`}></div>
        </div>

        {/* Bottom QR Section */}
        <div className="bg-white rounded-b-3xl px-6 pt-10 pb-8 flex flex-col items-center border-t-0 shadow-inner">
           
           {/* Timeline / Trace */}
           {data?.events && (
             <div className="w-full mb-8">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Blockchain Trace</p>
               <div className="space-y-4">
                 {data.events.slice(-3).map((evt: any, idx: number) => (
                   <div key={idx} className="flex items-center text-sm">
                     <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                     <div className="flex-1">
                       <p className="font-bold text-gray-900">{evt.eventType}</p>
                       <p className="text-xs text-gray-500">{new Date(evt.timestamp).toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* QR Code Placeholder / Real Data */}
           <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-6 flex flex-col items-center justify-center w-48 h-48">
              <QrCode className="w-32 h-32 text-gray-900" strokeWidth={1} />
           </div>

           {/* Tx Hash */}
           {data?.txHash && (
             <div className="text-center w-full">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Polygon EVM Hash</p>
                <p className="text-xs font-mono text-gray-600 bg-gray-50 py-2 px-3 rounded-md break-all border border-gray-100">{data.txHash}</p>
                <a href={`https://amoy.polygonscan.com/tx/${data.txHash}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#007aff] mt-3 inline-block uppercase tracking-widest hover:underline">
                  View on Explorer
                </a>
             </div>
           )}
           
        </div>
      </div>
    </main>
  );
}
