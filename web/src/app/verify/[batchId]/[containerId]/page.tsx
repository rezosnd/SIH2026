"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, MapPin, Calendar, Box, Droplet, ChevronRight, Activity, ShieldCheck, Search } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function VerificationPage() {
  const params = useParams();
  const batchId = params.batchId as string;
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
          body: JSON.stringify({
            // Backend extracts IP, User-Agent, and geolocation automatically
          }),
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
           setRiskReason('Warning: Suspicious QR activity detected. Unrealistic geographic movement or excessive scanning identified.');
        }
        
      } catch (err) {
        setStatus('INVALID');
      }
    }
    
    recordScan();
  }, [containerId]);

  if (status === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  const isVerified = status === 'VERIFIED';
  const isSuspicious = status === 'SUSPICIOUS';
  
  return (
    <main className="min-h-screen bg-[#fafafa] pb-12 font-sans text-gray-900">
      <div className="bg-white shadow-sm border-b border-gray-200">
         <div className="max-w-2xl mx-auto px-6 py-6 text-center flex flex-col items-center">
            <img 
              src="https://sih.gov.in/img1/SIH2026-logo.png" 
              alt="SIH 2026 Logo" 
              className="h-16 mb-4 object-contain"
            />
            <h1 className="text-2xl font-black tracking-widest uppercase text-gray-900">HoneyChain</h1>
            <p className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md border border-gray-200">Digital Honey Passport</p>
         </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className={`p-10 rounded-xl shadow-sm mb-8 flex flex-col items-center justify-center text-center border-2 ${
            isVerified ? 'bg-white border-green-500' : 
            isSuspicious ? 'bg-white border-red-500' : 
            'bg-white border-gray-200'
        }`}>
            {isVerified && <ShieldCheck className="w-20 h-20 text-green-600 mb-4" />}
            {isSuspicious && <AlertTriangle className="w-20 h-20 text-red-600 mb-4" />}
            {status === 'INVALID' && <XCircle className="w-20 h-20 text-gray-400 mb-4" />}
            
            <h2 className={`text-4xl font-black uppercase tracking-widest ${
               isVerified ? 'text-green-700' : isSuspicious ? 'text-red-700' : 'text-gray-900'
            }`}>
               {status}
            </h2>
            {isSuspicious && (
               <p className="mt-4 text-red-700 font-bold max-w-md mx-auto p-4 bg-red-50 rounded border border-red-200">
                  {riskReason}
               </p>
            )}
            {isVerified && (
               <p className="mt-4 text-green-800 font-bold max-w-md mx-auto p-4 bg-green-50 rounded border border-green-200">
                  Authenticity Confirmed. This product has passed all cryptographic and supply chain checks.
               </p>
            )}
        </div>

        {status !== 'INVALID' && data && (
           <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                 <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center">
                    <h3 className="font-bold text-black text-sm uppercase tracking-widest">Product Origin</h3>
                 </div>
                 <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-6">
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> Location</p>
                       <p className="font-bold text-black text-lg">{data.hive?.location || 'Unknown API'}</p>
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Harvest Date</p>
                       <p className="font-bold text-black text-lg">{new Date(data.harvestDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center"><Droplet className="w-4 h-4 mr-1.5" /> Batch ID</p>
                       <p className="font-mono text-sm font-bold text-black break-all bg-gray-100 px-2 py-1 rounded border border-gray-200 inline-block">{data.id}</p>
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center"><Box className="w-4 h-4 mr-1.5" /> Quality Status</p>
                       <p className="font-black text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200 inline-block text-xs tracking-widest uppercase">PASSED</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                 <div className="p-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-black text-sm uppercase tracking-widest">Honey Journey</h3>
                 </div>
                  <div className="p-8">
                     <div className="relative border-l-2 border-gray-200 ml-4 space-y-10 py-2">

                       {data.events?.map((evt: any, idx: number) => (
                          <div key={idx} className="relative pl-10">
                             <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-black border-4 border-white shadow-sm"></div>
                             <p className="text-xs font-black text-gray-900 uppercase mb-1 tracking-widest">{evt.eventType}</p>
                             <p className="text-gray-600 font-semibold text-base">{evt.description || 'Processing Completed'}</p>
                             <p className="text-xs font-bold text-gray-400 mt-1.5">{new Date(evt.timestamp).toLocaleString()}</p>
                          </div>
                       ))}
                       
                       {isVerified && (
                         <div className="relative pl-10">
                            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                            <p className="text-xs font-black text-green-700 uppercase mb-1 tracking-widest">Verified</p>
                            <p className="text-gray-900 font-bold text-base">Consumer Verification Passed</p>
                         </div>
                       )}

                    </div>
                 </div>
              </div>

              <div className="bg-black rounded-xl shadow-lg border border-gray-900 overflow-hidden text-gray-100 mb-12">
                 <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center text-sm uppercase tracking-widest"><Activity className="w-4 h-4 mr-2" /> Blockchain Proof</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">Polygon EVM</span>
                 </div>
                 <div className="p-8 space-y-5">
                    <div>
                       <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Transaction Hash</p>
                       <p className="text-sm font-mono text-gray-300 break-all bg-gray-900 p-4 rounded border border-gray-800">{data.txHash || '0xPendingNetworkConfirmation...'}</p>
                    </div>
                    {data.txHash && (
                       <a href={`https://amoy.polygonscan.com/tx/${data.txHash}`} target="_blank" className="text-xs font-bold text-white hover:text-gray-300 flex items-center mt-4 transition-colors uppercase tracking-widest underline underline-offset-4 decoration-gray-600">
                          View on Blockchain Explorer <ChevronRight className="w-4 h-4 ml-1" />
                       </a>
                    )}
                 </div>
              </div>
           </>
        )}
      </div>
    </main>
  );
}
