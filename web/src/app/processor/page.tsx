"use client";
import { useEffect, useState, useCallback } from 'react';
import { Package, CheckCircle, Clock, Beaker, Archive, ChevronRight, AlertCircle, Plus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';

async function getToken() {
  const r = await fetch(`${API}/auth/dev-login?role=PROCESSOR`);
  return (await r.json()).access_token as string;
}

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }[]> = {
  ASSIGNED:             [{ next: 'ACCEPTED', label: 'Accept Batch', color: 'bg-blue-600 hover:bg-blue-700' }],
  ACCEPTED:             [{ next: 'PROCESSING', label: 'Start Processing', color: 'bg-yellow-500 hover:bg-yellow-600' }],
  PROCESSING:           [{ next: 'PROCESSING_COMPLETED', label: 'Mark Complete', color: 'bg-orange-500 hover:bg-orange-600' }],
  PROCESSING_COMPLETED: [{ next: 'QUALITY_CHECKED', label: 'Pass Quality Check', color: 'bg-purple-600 hover:bg-purple-700' }],
  QUALITY_CHECKED:      [{ next: 'PACKAGED', label: 'Mark Packaged', color: 'bg-green-600 hover:bg-green-700' }],
};

const STATUS_COLOR: Record<string, string> = {
  ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  PROCESSING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROCESSING_COMPLETED: 'bg-orange-100 text-orange-700 border-orange-200',
  QUALITY_CHECKED: 'bg-purple-100 text-purple-700 border-purple-200',
  PACKAGED: 'bg-green-100 text-green-700 border-green-200',
  DISTRIBUTED: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function ProcessorDashboard() {
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
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );

  if (view === 'available') return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('dashboard')} className="text-sm font-bold text-gray-500 hover:text-black">&larr; Back</button>
          <h1 className="text-2xl font-black uppercase tracking-wide">Available Batches</h1>
        </div>
        <div className="grid gap-4">
          {available.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-400">No batches available for assignment.</p>
            </div>
          ) : available.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
              <div>
                <p className="font-black">Batch {b.id.slice(0,8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-1">Hive: {b.hive?.location} | Qty: {b.quantity}kg</p>
                <p className="text-xs text-gray-400 mt-1">Harvest: {new Date(b.harvestDate).toLocaleDateString()}</p>
              </div>
              <button onClick={() => assignBatch(b.id)} disabled={actionLoading} className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                Assign to Me
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === 'detail' && selectedBatch) return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="text-sm font-bold text-gray-500 hover:text-black">&larr; Back</button>
          <h1 className="text-2xl font-black uppercase tracking-wide">Batch {selectedBatch.id.slice(0,8).toUpperCase()}</h1>
          <StatusBadge status={selectedBatch.status} />
        </div>

        {/* Batch Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Batch Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hive</p><p className="font-semibold mt-1">{selectedBatch.hive?.location}</p></div>
            <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Quantity</p><p className="font-semibold mt-1">{selectedBatch.quantity}kg</p></div>
            <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Harvest Date</p><p className="font-semibold mt-1">{new Date(selectedBatch.harvestDate).toLocaleDateString()}</p></div>
            <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status</p><div className="mt-1"><StatusBadge status={selectedBatch.status} /></div></div>
          </div>
        </div>

        {/* Status Transitions */}
        {STATUS_FLOW[selectedBatch.status] && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Status Transition</h3>
            {STATUS_FLOW[selectedBatch.status].map(t => (
              <button key={t.next} onClick={() => transition(selectedBatch.id, t.next)} disabled={actionLoading}
                className={`${t.color} text-white font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 text-sm`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Quality Records */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Quality Records</h3>
          {selectedBatch.qualityRecords?.length > 0 ? (
            <table className="w-full text-sm mb-4">
              <thead><tr className="border-b"><th className="text-left py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Metric</th><th className="text-left py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Value</th></tr></thead>
              <tbody>{selectedBatch.qualityRecords.map((q: any) => <tr key={q.id} className="border-b border-gray-50"><td className="py-2 font-semibold">{q.metric}</td><td className="py-2 text-gray-600">{q.value}</td></tr>)}</tbody>
            </table>
          ) : <p className="text-sm text-gray-400 mb-4">No quality records yet.</p>}
          <div className="flex gap-3">
            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Metric (e.g. MOISTURE_CONTENT)" value={qualityMetric} onChange={e => setQualityMetric(e.target.value)} />
            <input className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Value (e.g. 17%)" value={qualityValue} onChange={e => setQualityValue(e.target.value)} />
            <button onClick={addQuality} disabled={actionLoading || !qualityMetric || !qualityValue} className="bg-black text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">Add</button>
          </div>
        </div>

        {/* Containers / Packaging */}
        {(selectedBatch.status === 'QUALITY_CHECKED' || selectedBatch.status === 'PACKAGED') && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Containers & QR Codes</h3>
            {containers.length > 0 && (
              <div className="mb-4 space-y-2">
                {containers.map(c => (
                  <div key={c.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                    <span className="font-mono text-xs text-gray-600">{c.qrData}</span>
                    <span className="text-xs font-bold text-gray-500">{c.containerSize}kg</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={containerSize} onChange={e => setContainerSize(e.target.value)}>
                <option value="0.25">0.25 kg</option>
                <option value="0.5">0.5 kg</option>
                <option value="1">1 kg</option>
                <option value="2">2 kg</option>
                <option value="5">5 kg</option>
              </select>
              <button onClick={createContainer} disabled={actionLoading} className="bg-black text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Generate QR Container
              </button>
            </div>
          </div>
        )}

        {/* Supply Chain Events */}
        {selectedBatch.events?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Supply Chain Timeline</h3>
            <div className="space-y-3">
              {selectedBatch.events.map((e: any) => (
                <div key={e.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-black mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{e.eventType.replace(/_/g, ' ')}</p>
                    {e.description && <p className="text-xs text-gray-500">{e.description}</p>}
                    <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide">Processor Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome, {dashboard?.name || 'Processor'} — {dashboard?.facility}</p>
          </div>
          <button onClick={() => setView('available')} className="bg-black text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors">
            View Available Batches ({dashboard?.availableBatches ?? 0})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned</p><p className="text-4xl font-black">{dashboard?.assigned ?? 0}</p></div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">In Progress</p><p className="text-4xl font-black text-yellow-600">{dashboard?.inProgress ?? 0}</p></div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Completed</p><p className="text-4xl font-black text-green-600">{dashboard?.completed ?? 0}</p></div>
        </div>

        {/* Batch List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-sm uppercase tracking-wider">My Assigned Batches</h3></div>
          {(!dashboard?.batches || dashboard.batches.length === 0) ? (
            <div className="p-12 text-center text-gray-400 font-semibold">No batches assigned yet. Click "View Available Batches" to pick one up.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Batch ID', 'Hive', 'Quantity', 'Status', 'Last Updated', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dashboard.batches.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs">{b.id.slice(0,8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-gray-600">{b.hive?.location || '—'}</td>
                    <td className="px-5 py-4 font-bold">{b.quantity}kg</td>
                    <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{new Date(b.updatedAt).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setSelectedBatch(b); setView('detail'); }} className="flex items-center text-sm font-bold text-gray-700 hover:text-black">
                        Manage <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
