"use client";
import { useEffect, useState, useCallback } from 'react';
import { Package, CheckCircle, Clock, Beaker, Archive, ChevronRight, AlertCircle, Plus, Printer, Settings, ClipboardList, Loader, PackageSearch, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-eight-jade-26.vercel.app';

async function getToken() {
  const r = await fetch(`${API}/auth/dev-login?role=PROCESSOR`);
  return (await r.json()).access_token as string;
}

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }[]> = {
  ASSIGNED:             [{ next: 'ACCEPTED', label: 'Accept Batch', color: 'bg-[#111111] hover:bg-[#222222]' }],
  ACCEPTED:             [{ next: 'PROCESSING', label: 'Start Processing', color: 'bg-[#111111] hover:bg-[#222222]' }],
  PROCESSING:           [{ next: 'PROCESSING_COMPLETED', label: 'Mark Complete', color: 'bg-[#111111] hover:bg-[#222222]' }],
  PROCESSING_COMPLETED: [{ next: 'QUALITY_CHECKED', label: 'Pass Quality Check', color: 'bg-[#111111] hover:bg-[#222222]' }],
  QUALITY_CHECKED:      [{ next: 'PACKAGED', label: 'Mark Packaged', color: 'bg-[#111111] hover:bg-[#222222]' }],
};

const STATUS_COLOR: Record<string, string> = {
  ASSIGNED: 'bg-gray-50 text-gray-700 border-gray-200',
  ACCEPTED: 'bg-gray-50 text-gray-700 border-gray-200',
  PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
  PROCESSING_COMPLETED: 'bg-amber-50 text-amber-700 border-amber-200',
  QUALITY_CHECKED: 'bg-blue-50 text-blue-700 border-blue-200',
  PACKAGED: 'bg-green-50 text-green-700 border-green-200',
  DISTRIBUTED: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function ProcessorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [dashboard, setDashboard] = useState<any>(null);
  const [available, setAvailable] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'available' | 'detail'>('dashboard');
  const [actionLoading, setActionLoading] = useState(false);
  const [qualityMetric, setQualityMetric] = useState('');
  const [qualityValue, setQualityValue] = useState('');
  const [containerSize, setContainerSize] = useState('0.5');
  const [containers, setContainers] = useState<any[]>([]);

  const load = useCallback(async () => {
    const t = token || await getToken();
    if (!token) setToken(t);
    const headers = { Authorization: `Bearer ${t}` };
    const [dashRes, availRes] = await Promise.all([
      fetch(`${API}/processor/dashboard`, { headers }),
      fetch(`${API}/processor/batches/available`, { headers }),
    ]);
    if (dashRes.ok) setDashboard(await dashRes.json());
    if (availRes.ok) setAvailable(await availRes.json());
  }, [token]);

  useEffect(() => { load(); }, []);

  const assignBatch = async (batchId: string) => {
    setActionLoading(true);
    try {
      await fetch(`${API}/processor/batches/${batchId}/assign`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      await load();
      setView('dashboard');
    } finally { setActionLoading(false); }
  };

  const transition = async (batchId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/processor/batches/${batchId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedBatch(updated);
        await load();
      }
    } finally { setActionLoading(false); }
  };

  const addQuality = async () => {
    if (!qualityMetric || !qualityValue) return;
    setActionLoading(true);
    try {
      await fetch(`${API}/processor/batches/${selectedBatch.id}/quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ metric: qualityMetric, value: qualityValue }),
      });
      setQualityMetric(''); setQualityValue('');
      const res = await fetch(`${API}/processor/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setDashboard(d);
        const fresh = d.batches?.find((b: any) => b.id === selectedBatch.id);
        if (fresh) setSelectedBatch(fresh);
      }
    } finally { setActionLoading(false); }
  };

  const createContainer = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/processor/batches/${selectedBatch.id}/containers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ containerSize: parseFloat(containerSize) }),
      });
      if (res.ok) {
        const newContainer = await res.json();
        setContainers(prev => [...prev, newContainer]);
      }
    } finally { setActionLoading(false); }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border tracking-wider uppercase ${STATUS_COLOR[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center font-sans p-4">
        <div className="bg-white p-10 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full max-w-sm text-center border border-[#E5E5E5]">
          <div className="flex justify-center mb-6"><Settings className="w-10 h-10 text-[#111111]" strokeWidth={1.8} /></div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#111111] mb-2">Processor Portal</h1>
          <p className="text-[13px] text-[#666666] mb-8 font-medium">Enter your secure password to continue</p>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3.5 rounded-[12px] border border-[#E5E5E5] focus:outline-none focus:border-[#111111] mb-6 text-center font-mono text-[15px]"
            onKeyDown={e => e.key === 'Enter' && password === 'password123' && setIsAuthenticated(true)}
          />
          <button 
            onClick={() => password === 'password123' && setIsAuthenticated(true)}
            className="w-full bg-[#111111] text-white font-semibold py-3.5 rounded-[12px] hover:bg-[#222222] transition-all active:scale-[0.98] text-[14px]"
          >
            SECURE LOGIN
          </button>
        </div>
      </div>
    );
  }

  if (view === 'available') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans pb-12">
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-6 md:py-8">
            <button onClick={() => setView('dashboard')} className="text-[13px] font-bold text-[#666666] hover:text-[#111111] mb-4 flex items-center gap-1 transition-colors">
              &larr; Back to Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111111] tracking-tight">AVAILABLE BATCHES</h1>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-8">
          <div className="grid gap-5">
            {available.length === 0 ? (
              <div className="bg-white rounded-[18px] p-16 text-center border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <PackageSearch className="w-12 h-12 text-[#E5E5E5] mx-auto mb-4" strokeWidth={1.5} />
                <h4 className="text-[16px] font-bold text-[#111111] mb-2">No available batches</h4>
                <p className="text-[#666666] text-[14px]">There are currently no new batches waiting for assignment.</p>
              </div>
            ) : available.map(b => (
              <div key={b.id} className="bg-white rounded-[18px] border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                  <div><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Batch ID</p><p className="font-mono text-[15px] font-semibold text-[#111111]">{b.id.slice(0,8).toUpperCase()}</p></div>
                  <div><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Hive</p><p className="text-[15px] text-[#222222] font-medium">{b.hive?.location}</p></div>
                  <div><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Quantity</p><p className="text-[15px] text-[#222222] font-bold">{b.quantity} kg</p></div>
                  <div><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Harvest Date</p><p className="text-[14px] text-[#666666]">{new Date(b.harvestDate).toLocaleDateString()}</p></div>
                </div>
                <button onClick={() => assignBatch(b.id)} disabled={actionLoading} className="bg-[#111111] text-white text-[14px] font-semibold px-8 py-3.5 rounded-[12px] hover:bg-[#222222] transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap self-start md:self-center">
                  Assign to Me
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedBatch) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans pb-12">
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1000px] mx-auto px-5 md:px-10 py-6 md:py-8">
            <button onClick={() => setView('dashboard')} className="text-[13px] font-bold text-[#666666] hover:text-[#111111] mb-4 flex items-center gap-1 transition-colors">
              &larr; Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#111111] tracking-tight flex items-center gap-3">
                BATCH <span className="font-mono bg-[#F7F7F7] px-3 py-1 rounded-[8px] border border-[#E5E5E5] text-[24px]">{selectedBatch.id.slice(0,8).toUpperCase()}</span>
              </h1>
              <div className="self-start md:self-center"><StatusBadge status={selectedBatch.status} /></div>
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-5 md:px-10 pt-8 space-y-8">
          
          {/* Batch Info */}
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-7 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-[13px] uppercase tracking-widest text-[#888888] mb-6">Batch Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div><p className="text-[11px] text-[#888888] font-bold uppercase tracking-widest mb-1.5">Hive</p><p className="font-medium text-[#222222] text-[15px]">{selectedBatch.hive?.location}</p></div>
              <div><p className="text-[11px] text-[#888888] font-bold uppercase tracking-widest mb-1.5">Quantity</p><p className="font-bold text-[#222222] text-[15px]">{selectedBatch.quantity} kg</p></div>
              <div><p className="text-[11px] text-[#888888] font-bold uppercase tracking-widest mb-1.5">Harvest Date</p><p className="font-medium text-[#666666] text-[15px]">{new Date(selectedBatch.harvestDate).toLocaleDateString()}</p></div>
              <div><p className="text-[11px] text-[#888888] font-bold uppercase tracking-widest mb-1.5">Current Status</p><div className="mt-1"><StatusBadge status={selectedBatch.status} /></div></div>
            </div>
          </div>

          {/* Status Transitions */}
          {STATUS_FLOW[selectedBatch.status] && (
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-7 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <h3 className="font-bold text-[13px] uppercase tracking-widest text-[#888888] mb-6">Status Transition</h3>
              <div className="flex flex-wrap gap-4">
                {STATUS_FLOW[selectedBatch.status].map(t => (
                  <button key={t.next} onClick={() => transition(selectedBatch.id, t.next)} disabled={actionLoading}
                    className={`bg-[#111111] hover:bg-[#222222] text-white font-semibold px-8 py-3.5 rounded-[12px] transition-all active:scale-[0.98] disabled:opacity-50 text-[14px]`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality Records */}
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-7 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-[13px] uppercase tracking-widest text-[#888888] mb-6">Quality Records</h3>
            {selectedBatch.qualityRecords?.length > 0 ? (
              <div className="overflow-hidden border border-[#E5E5E5] rounded-[12px] mb-6">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <tr>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888888] uppercase tracking-widest">Metric</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888888] uppercase tracking-widest">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {selectedBatch.qualityRecords.map((q: any) => (
                      <tr key={q.id}>
                        <td className="px-6 py-4 font-semibold text-[#222222] text-[14px]">{q.metric}</td>
                        <td className="px-6 py-4 text-[#666666] text-[14px]">{q.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-[14px] text-[#666666] mb-6">No quality records attached to this batch yet.</p>}
            
            <div className="flex flex-col md:flex-row gap-3">
              <input className="flex-1 border border-[#E5E5E5] rounded-[12px] px-4 py-3 text-[14px] focus:outline-none focus:border-[#111111] transition-colors" placeholder="Metric (e.g. MOISTURE_CONTENT)" value={qualityMetric} onChange={e => setQualityMetric(e.target.value)} />
              <input className="md:w-48 border border-[#E5E5E5] rounded-[12px] px-4 py-3 text-[14px] focus:outline-none focus:border-[#111111] transition-colors" placeholder="Value (e.g. 17%)" value={qualityValue} onChange={e => setQualityValue(e.target.value)} />
              <button onClick={addQuality} disabled={actionLoading || !qualityMetric || !qualityValue} className="bg-[#111111] text-white font-semibold px-6 py-3 rounded-[12px] text-[14px] hover:bg-[#222222] transition-all active:scale-[0.98] disabled:opacity-50">Add Record</button>
            </div>
          </div>

          {/* Containers / Packaging */}
          {(selectedBatch.status === 'QUALITY_CHECKED' || selectedBatch.status === 'PACKAGED') && (
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-7 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <h3 className="font-bold text-[13px] uppercase tracking-widest text-[#888888] mb-6">Containers & QR Codes</h3>
              {containers.length > 0 && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {containers.map(c => {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://honey-sih-kiit.vercel.app';
                    const qrUrl = `${baseUrl}/verify/batch/${c.qrData}`;
                    
                    const handlePrint = () => {
                      const svg = document.getElementById(`qr-${c.id}`);
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const printWindow = window.open('', '', 'width=600,height=600');
                      if (!printWindow) return;
                      printWindow.document.write(`
                        <html>
                          <head><title>Print Label - ${c.qrData}</title></head>
                          <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;flex-direction:column;font-family:sans-serif;">
                            <div style="text-align:center;padding:40px;border:2px solid #000;border-radius:24px;width:300px;">
                              ${svgData.replace('<svg', '<svg style="width:220px;height:220px;margin:0 auto;"')}
                              <h2 style="margin-top:24px;font-family:monospace;letter-spacing:1px;font-size:18px;">${c.qrData}</h2>
                              <p style="color:#000;font-weight:bold;font-size:20px;margin-top:8px;">${c.containerSize} kg</p>
                              <p style="color:#666;font-size:12px;margin-top:16px;">HONEYCHAIN SECURE TRACEABILITY</p>
                            </div>
                            <script>
                              window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    };

                    return (
                      <div key={c.id} className="flex flex-col items-center justify-center border border-[#E5E5E5] rounded-[16px] p-6 bg-[#FAFAFA] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#111111]"></div>
                        <div className="bg-white p-3 rounded-[12px] shadow-sm border border-[#E5E5E5] mb-5 group-hover:scale-105 transition-transform">
                          <QRCodeSVG id={`qr-${c.id}`} value={qrUrl} size={140} level="H" includeMargin={false} />
                        </div>
                        <div className="text-center w-full">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-1.5">Secure QR Code</p>
                          <p className="font-mono text-[11px] text-[#555555] break-all bg-white px-2.5 py-1.5 rounded-[6px] border border-[#E5E5E5]">{c.qrData}</p>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E5E5E5] w-full">
                            <span className="text-[15px] font-bold text-[#111111]">{c.containerSize} kg</span>
                            <button onClick={handlePrint} className="text-[11px] font-bold uppercase bg-[#111111] text-white px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 hover:bg-[#222222] transition-colors active:scale-[0.98]">
                              <Printer className="w-3.5 h-3.5" /> Print
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <select className="border border-[#E5E5E5] rounded-[12px] px-4 py-3 text-[14px] focus:outline-none focus:border-[#111111] transition-colors bg-white sm:w-48" value={containerSize} onChange={e => setContainerSize(e.target.value)}>
                  <option value="0.25">0.25 kg Container</option>
                  <option value="0.5">0.5 kg Container</option>
                  <option value="1">1.0 kg Container</option>
                  <option value="2">2.0 kg Container</option>
                  <option value="5">5.0 kg Container</option>
                </select>
                <button onClick={createContainer} disabled={actionLoading} className="bg-[#111111] text-white font-semibold px-6 py-3 rounded-[12px] text-[14px] hover:bg-[#222222] disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Plus className="w-4 h-4" /> Generate QR Container
                </button>
              </div>
            </div>
          )}

          {/* Supply Chain Events */}
          {selectedBatch.events?.length > 0 && (
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-7 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <h3 className="font-bold text-[13px] uppercase tracking-widest text-[#888888] mb-6">Supply Chain Timeline</h3>
              <div className="space-y-6">
                {selectedBatch.events.map((e: any, index: number) => (
                  <div key={e.id} className="flex gap-4 relative">
                    {index !== selectedBatch.events.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-[#E5E5E5]" />
                    )}
                    <div className="w-4 h-4 rounded-full border-[4px] border-white bg-[#111111] mt-0.5 flex-shrink-0 shadow-[0_0_0_2px_#E5E5E5] z-10" />
                    <div>
                      <p className="font-bold text-[#111111] text-[14px] mb-1">{e.eventType.replace(/_/g, ' ')}</p>
                      {e.description && <p className="text-[13px] text-[#555555] mb-1">{e.description}</p>}
                      <p className="text-[12px] font-medium text-[#888888]">{new Date(e.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans pb-12">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-6 md:py-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[#888888] font-bold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> HoneyChain</p>
                <h1 className="text-3xl md:text-[36px] font-bold text-[#111111] tracking-tight leading-none mb-3">PROCESSOR PORTAL</h1>
                <p className="text-[#555555] text-[15px]">Welcome back, Processor — <span className="font-semibold text-[#111111]">{dashboard?.facility || 'Main Facility'}</span></p>
              </div>
              <button onClick={() => setView('available')} className="bg-[#111111] text-white px-6 py-4 rounded-[14px] hover:bg-[#222222] transition-all active:scale-[0.98] flex items-center justify-between gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] group">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[13px] font-bold tracking-wide uppercase">View Available Batches</span>
                  <span className="text-[11px] text-[#A0A0A0]">{dashboard?.availableBatches ?? 0} Available</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-[18px] p-7 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[12px] font-bold text-[#555555] uppercase tracking-widest">Assigned</p>
              <ClipboardList className="w-5 h-5 text-[#888888]" strokeWidth={1.8} />
            </div>
            <p className="text-[42px] font-bold text-[#000000] leading-none mb-2">{dashboard?.assigned ?? 0}</p>
            <p className="text-[13px] text-[#666666] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#888888]"></span> Pending operations
            </p>
          </div>
          
          <div className="bg-white rounded-[18px] p-7 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[12px] font-bold text-[#555555] uppercase tracking-widest">In Progress</p>
              <Loader className="w-5 h-5 text-[#888888]" strokeWidth={1.8} />
            </div>
            <p className="text-[42px] font-bold text-[#000000] leading-none mb-2">{dashboard?.inProgress ?? 0}</p>
            <p className="text-[13px] text-[#666666] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Active processing
            </p>
          </div>

          <div className="bg-white rounded-[18px] p-7 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[12px] font-bold text-[#555555] uppercase tracking-widest">Completed</p>
              <CheckCircle className="w-5 h-5 text-[#888888]" strokeWidth={1.8} />
            </div>
            <p className="text-[42px] font-bold text-[#000000] leading-none mb-2">{dashboard?.completed ?? 0}</p>
            <p className="text-[13px] text-[#666666] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Successfully finished
            </p>
          </div>
        </div>

        {/* Batch List */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-5 md:px-8 py-6 border-b border-[#E5E5E5] flex justify-between items-center bg-white">
            <h3 className="font-bold text-[16px] text-[#111111]">MY ASSIGNED BATCHES</h3>
            <span className="text-[13px] font-medium text-[#666666] bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#E5E5E5]">{dashboard?.batches?.length || 0} batches</span>
          </div>
          
          {(!dashboard?.batches || dashboard.batches.length === 0) ? (
            <div className="p-10 md:p-16 text-center bg-white">
              <ClipboardList className="w-12 h-12 text-[#E5E5E5] mx-auto mb-4" strokeWidth={1.5} />
              <h4 className="text-[16px] font-bold text-[#111111] mb-2">No batches assigned</h4>
              <p className="text-[#666666] text-[14px] max-w-sm mx-auto mb-6">You currently have no batches waiting for processing. Check the available batches queue.</p>
              <button onClick={() => setView('available')} className="bg-white text-[#111111] font-semibold border border-[#E5E5E5] px-6 py-2.5 rounded-[10px] hover:bg-[#F7F7F7] transition-colors text-[14px]">View Available Batches</button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block w-full overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <tr>
                      {['Batch ID', 'Hive', 'Quantity', 'Status', 'Last Updated', ''].map((h, i) => (
                        <th key={i} className="px-8 py-4 text-[12px] font-bold text-[#555555] uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {dashboard.batches.map((b: any) => (
                      <tr key={b.id} className="hover:bg-[#FAFAFA] transition-colors group">
                        <td className="px-8 py-5 font-mono text-[14px] font-semibold text-[#111111] whitespace-nowrap">{b.id.slice(0,8).toUpperCase()}</td>
                        <td className="px-8 py-5 text-[#222222] font-medium text-[14px] whitespace-nowrap">{b.hive?.location || '—'}</td>
                        <td className="px-8 py-5 text-[#222222] font-bold text-[14px] whitespace-nowrap">{b.quantity} kg</td>
                        <td className="px-8 py-5 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                        <td className="px-8 py-5 text-[#666666] text-[14px] whitespace-nowrap">{new Date(b.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                        <td className="px-8 py-5 text-right whitespace-nowrap">
                          <button onClick={() => { setSelectedBatch(b); setView('detail'); }} className="inline-flex items-center text-[14px] font-semibold text-[#111111] hover:underline underline-offset-4 group-hover:text-black transition-all">
                            Manage <ArrowRight className="w-4 h-4 ml-1.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden divide-y divide-[#E5E5E5] bg-white">
                {dashboard.batches.map((b: any) => (
                  <div key={b.id} className="p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex justify-between items-center mb-5">
                      <span className="font-mono text-[15px] font-bold text-[#111111]">{b.id.slice(0,8).toUpperCase()}</span>
                      <button onClick={() => { setSelectedBatch(b); setView('detail'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-[8px] text-[12px] font-bold text-[#111111]">
                        Manage <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-[13px]">
                        <div><p className="text-[#888888] font-bold uppercase tracking-widest text-[10px] mb-1">Hive</p><p className="text-[#222222] font-medium">{b.hive?.location || '—'}</p></div>
                        <div><p className="text-[#888888] font-bold uppercase tracking-widest text-[10px] mb-1">Quantity</p><p className="text-[#222222] font-bold">{b.quantity} kg</p></div>
                        <div><p className="text-[#888888] font-bold uppercase tracking-widest text-[10px] mb-1">Status</p><div className="mt-0.5"><StatusBadge status={b.status} /></div></div>
                        <div><p className="text-[#888888] font-bold uppercase tracking-widest text-[10px] mb-1">Updated</p><p className="text-[#666666]">{new Date(b.updatedAt).toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
