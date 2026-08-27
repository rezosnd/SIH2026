"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, MapPin, CheckCircle2, ChevronRight, Hash, Package } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function BatchVerificationPage() {
  const params = useParams();
  const qrData = params.qrData as string;

  const [status, setStatus] = useState<'LOADING' | 'VERIFIED' | 'SUSPICIOUS' | 'INVALID'>('LOADING');
  const [data, setData] = useState<any>(null);
  const [riskReason, setRiskReason] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        // Try to record a QR scan (might fail if this is a batch QR not a container QR — that's OK)
        let scanStatus = 'VERIFIED';
        try {
          const scanRes = await fetch(`${apiUrl}/qr/${encodeURIComponent(qrData)}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          if (scanRes.ok) {
            const scanResult = await scanRes.json();
            scanStatus = scanResult.status || 'VERIFIED';
            if (scanStatus === 'SUSPICIOUS') {
              setRiskReason(scanResult.riskReason || 'Suspicious scanning pattern detected.');
            }
          }
        } catch {
          // Container QR scan failed — this is a batch QR, scanStatus stays VERIFIED
        }

        // Fetch batch data using batch-level QR verification
        const batchRes = await fetch(`${apiUrl}/batches/verify/${encodeURIComponent(qrData)}`);
        if (!batchRes.ok) {
          setStatus('INVALID');
          return;
        }
        const batchData = await batchRes.json();
        setData(batchData);
        setStatus(scanStatus as any);
      } catch {
        setStatus('INVALID');
      }
    }

    setTimeout(verify, 800);
  }, [qrData]);

  if (status === 'LOADING') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#f2f2f7] p-4">
        <div className="w-full max-w-sm h-full max-h-[750px] bg-white rounded-3xl drop-shadow-xl flex flex-col overflow-hidden animate-pulse">
          <div className="h-[55%] bg-gray-200 w-full rounded-b-3xl"></div>
          <div className="flex-1 p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-16 bg-gray-100 rounded-xl w-full mt-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = status === 'VERIFIED';
  const isSuspicious = status === 'SUSPICIOUS';

  const themeGradients = {
    VERIFIED: 'bg-gradient-to-br from-green-500 to-emerald-700',
    SUSPICIOUS: 'bg-gradient-to-br from-red-500 to-rose-700',
    INVALID: 'bg-gradient-to-br from-gray-600 to-gray-800',
  };

  const currentGradient = themeGradients[status] || themeGradients.INVALID;

  return (
    <main className="h-[100dvh] bg-[#f2f2f7] flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      <div className="w-full max-w-sm h-full max-h-[750px] relative drop-shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-500 ease-out">

        {/* Top Colored Section */}
        <div className={`rounded-t-3xl flex-shrink-0 flex flex-col relative ${currentGradient}`}>

          {/* Top Header */}
          <div className="px-5 pt-6 pb-2 flex justify-between items-start">
            <div className="flex flex-col">
              <img src="https://sih.gov.in/img1/SIH2026-logo.png" alt="SIH" className="h-6 w-auto brightness-0 invert opacity-100 mb-1 drop-shadow-md" />
              <h1 className="text-white font-black text-xl tracking-tight drop-shadow-sm">HoneyChain</h1>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-white/90 text-[9px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full mb-1">Status</p>
              <p className="text-white font-black text-2xl leading-none drop-shadow-md">{status}</p>
            </div>
          </div>

          {/* Location Info */}
          <div className="px-6 py-4 border-t border-white/20 mt-3 flex items-center">
            <div className="bg-white/20 p-3 rounded-full mr-4 shadow-sm backdrop-blur-sm">
              <MapPin className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-0.5 drop-shadow-sm">Source Apiary</p>
              <p className="text-white font-black text-xl truncate drop-shadow-md">
                {data?.hive?.location || (status === 'INVALID' ? 'Unknown' : 'Not Available')}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="px-6 pb-5 pt-2 flex justify-between">
            <div>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-0.5 drop-shadow-sm">Harvested</p>
              <p className="text-white font-bold text-base drop-shadow-sm">
                {data?.harvestDate ? new Date(data.harvestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-0.5 drop-shadow-sm">Quantity</p>
              <p className="text-white font-bold text-base drop-shadow-sm">{data?.quantity ? `${data.quantity}kg` : '--'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-0.5 drop-shadow-sm">Batch</p>
              <p className="text-white font-bold text-base font-mono drop-shadow-sm">{data?.id?.substring(0, 6).toUpperCase() || '--'}</p>
            </div>
          </div>

          {/* Message */}
          <div className="px-6 pb-6 text-center">
            <div className="inline-flex items-center justify-center bg-black/25 backdrop-blur-md rounded-xl px-4 py-3 w-full shadow-inner border border-white/10">
              {isVerified ? <ShieldCheck className="w-5 h-5 text-white mr-2" /> : isSuspicious ? <AlertTriangle className="w-5 h-5 text-white mr-2" /> : <XCircle className="w-5 h-5 text-white mr-2" />}
              <p className="text-white text-sm font-bold truncate">
                {isSuspicious ? riskReason : isVerified ? 'Verified Authentic Product' : 'Invalid QR Code — Not Found'}
              </p>
            </div>
          </div>
        </div>

        {/* Cutout Separator */}
        <div className="relative h-6 -my-3 z-10 flex items-center flex-shrink-0">
          <div className="absolute left-0 w-6 h-6 -ml-3 rounded-full bg-[#f2f2f7] shadow-inner"></div>
          <div className="w-full border-t-[3px] border-dashed border-gray-300 opacity-60"></div>
          <div className="absolute right-0 w-6 h-6 -mr-3 rounded-full bg-[#f2f2f7] shadow-inner"></div>
        </div>

        {/* Bottom Section */}
        <div className="bg-white rounded-b-3xl px-6 pt-6 pb-6 flex-1 flex flex-col shadow-inner border-t-0 overflow-y-auto">

          {/* Beekeeper Info */}
          {data?.hive?.beekeeper && (
            <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Beekeeper</p>
              <p className="font-black text-gray-900">{data.hive.beekeeper.name}</p>
              {data.hive.beekeeper.farmLocation && (
                <p className="text-xs text-gray-500 mt-0.5">{data.hive.beekeeper.farmLocation}</p>
              )}
            </div>
          )}

          {/* Supply Chain Timeline */}
          {data?.events && data.events.length > 0 && (
            <div className="w-full flex-1 mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Supply Chain Trace</p>
              <div className="space-y-3">
                {data.events.slice(-4).map((evt: any, idx: number) => (
                  <div key={idx} className="flex items-start text-sm bg-[#fafafa] p-3 rounded-xl border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate">{evt.eventType?.replace(/_/g, ' ')}</p>
                      {evt.description && <p className="text-[10px] text-gray-500 truncate">{evt.description}</p>}
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(evt.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No events state */}
          {data && (!data.events || data.events.length === 0) && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <Package className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-xs font-bold text-gray-400">Batch harvested — processing in progress</p>
            </div>
          )}

          {/* Blockchain Tx Hash */}
          {data?.txHash && (
            <div className="w-full mt-auto bg-gray-900 rounded-2xl p-4 flex flex-col items-center shadow-lg border border-gray-800">
              <div className="flex items-center text-gray-400 mb-1.5">
                <Hash className="w-3.5 h-3.5 mr-1.5" />
                <p className="text-[10px] font-black uppercase tracking-widest">Polygon EVM Tx</p>
              </div>
              <p className="text-[11px] font-mono text-gray-200 break-all text-center leading-relaxed mb-3 px-2">{data.txHash}</p>
              <a
                href={`https://amoy.polygonscan.com/tx/${data.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black text-gray-900 bg-white hover:bg-gray-200 transition-colors px-5 py-2 rounded-full uppercase tracking-widest flex items-center shadow-md"
              >
                Verify on Explorer <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
