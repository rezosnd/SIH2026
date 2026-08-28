"use client";
import { useEffect, useState } from 'react';
import { BarChart3, Users, Hexagon, Package, ShieldAlert, Activity, AlertTriangle, ChevronRight, TrendingUp, XCircle, Plus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';

async function getToken() {
  const r = await fetch(`${API}/auth/dev-login?role=KVIC`);
  return (await r.json()).access_token as string;
}

export default function KvicDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [selectedHive, setSelectedHive] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBk, setNewBk] = useState({ name: '', email: '', password: '', farmLocation: '', contact: '' });

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setToken(t);
      const headers = { Authorization: `Bearer ${t}` };
      const res = await fetch(`${API}/kvic/dashboard`, { headers });
      if (res.ok) setDashboard(await res.json());
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const endpoints: Record<string, string> = {
      clusters: '/kvic/clusters',
      beekeepers: '/kvic/beekeepers',
      hives: '/kvic/hives',
      batches: '/kvic/batches',
      qr: '/kvic/qr-activity',
      security: '/kvic/security-alerts',
    };
    const ep = endpoints[activeSection];
    if (!ep) return;
    setLoading(true);
    fetch(`${API}${ep}`, { headers }).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [activeSection, token]);

  const handleAddBeekeeper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/kvic/beekeepers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBk),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewBk({ name: '', email: '', password: '', farmLocation: '', contact: '' });
        // Refresh beekeepers
        fetch(`${API}/kvic/beekeepers`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => setData(d));
      } else {
        alert('Failed to add beekeeper');
      }
    } catch (err) {
      alert('Error adding beekeeper');
    }
  };

  const fetchHiveDetails = async (id: string) => {
    try {
      const res = await fetch(`${API}/iot/hives/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setSelectedHive(await res.json());
        setActiveSection('iot_details');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAiAnalysis = async (hiveId: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch(`${API}/iot/hives/${hiveId}/analysis`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAiAnalysis(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    // In a real app, clear cookies/tokens
    window.location.href = '/';
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center w-full px-4 py-3 rounded-md font-semibold text-sm transition-colors ${
        activeSection === id ? 'bg-black text-white' : 'text-gray-600 hover:text-black hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />{label}
    </button>
  );

  const Stat = ({ label, value, color = 'text-gray-900' }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{loading ? '—' : (value ?? 0)}</p>
    </div>
  );

  const MetricCard = ({ label, value, color = 'text-gray-900' }: any) => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex font-sans">
      <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-black tracking-widest uppercase">HoneyChain</h1>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">KVIC Command Center</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem id="overview" icon={BarChart3} label="Overview" />
          <NavItem id="clusters" icon={Hexagon} label="Clusters" />
          <NavItem id="beekeepers" icon={Users} label="Beekeepers" />
          <NavItem id="hives" icon={Activity} label="Hives" />
          <NavItem id="batches" icon={Package} label="Batches" />
          <NavItem id="qr" icon={TrendingUp} label="QR Activity" />
          <NavItem id="security" icon={ShieldAlert} label="Security Alerts" />
        </nav>
        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <a href="/admin" className="flex items-center px-4 py-2 text-gray-500 hover:text-black text-sm font-semibold transition-colors">
            <ShieldAlert className="w-4 h-4 mr-2" /> Admin View
          </a>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm font-semibold transition-colors w-full text-left">
            <XCircle className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
          <h2 className="text-xl font-black uppercase tracking-wide">
            {activeSection === 'overview' && 'KVIC National Overview'}
            {activeSection === 'clusters' && 'Beekeeper Clusters'}
            {activeSection === 'beekeepers' && 'All Beekeepers'}
            {activeSection === 'hives' && 'All Hives'}
            {activeSection === 'batches' && 'All Honey Batches'}
            {activeSection === 'qr' && 'QR Activity Monitor'}
            {activeSection === 'security' && 'Security Alerts'}
          </h2>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-0.5">Read-only national view</p>
        </header>

        <div className="p-8">
          {activeSection === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <Stat label="Clusters" value={dashboard?.clusters} />
              <Stat label="Beekeepers" value={dashboard?.beekeepers} />
              <Stat label="Active Hives" value={dashboard?.hives} />
              <Stat label="Honey Batches" value={dashboard?.batches} />
              <Stat label="Total Honey (kg)" value={dashboard?.totalHoneyKg} />
              <Stat label="Suspicious Scans" value={dashboard?.suspiciousScans} color="text-red-700" />
              <Stat label="Open Alerts" value={dashboard?.openAlerts} color="text-red-700" />
            </div>
          )}

          {(activeSection === 'clusters') && !loading && (
            <div className="grid gap-4">
              {(Array.isArray(data) ? data : []).length === 0 ? <p className="text-gray-400 font-semibold text-center py-16">No clusters found.</p> :
                (Array.isArray(data) ? data : []).map((c: any) => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-lg">{c.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{c.location}</p>
                        {c.description && <p className="text-gray-400 text-xs mt-1">{c.description}</p>}
                      </div>
                      <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full">{c.users?.length ?? 0} members</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {activeSection === 'beekeepers' && !loading && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                  <h2 className="font-bold text-lg">Registered Beekeepers</h2>
                  <p className="text-gray-500 text-xs">Manage beekeepers across all clusters</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Beekeeper
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Farm Location', 'Cluster', 'Hives', 'Batches', 'Contact'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(Array.isArray(data) ? data : []).length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">No beekeepers registered.</td></tr>
                  ) : (Array.isArray(data) ? data : []).map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold">{b.name}</td>
                      <td className="px-5 py-4 text-gray-600">{b.farmLocation}</td>
                      <td className="px-5 py-4 text-gray-600">{b.user?.cluster?.name || '—'}</td>
                      <td className="px-5 py-4 font-bold">{b.hives?.length ?? 0}</td>
                      <td className="px-5 py-4 font-bold">{b.batches?.length ?? 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{b.contact || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {activeSection === 'hives' && !loading && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Location', 'Status', 'IoT Connection', 'Temp / Hum', 'Beekeeper', 'Total Batches', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(Array.isArray(data) ? data : []).length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">No hives registered.</td></tr>
                  ) : (Array.isArray(data) ? data : []).map((h: any) => {
                    const isOnline = h.device?.lastSeenAt && (new Date().getTime() - new Date(h.device.lastSeenAt).getTime() < 120000);
                    const latest = h.sensorReadings?.[0];
                    return (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold">{h.location}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${h.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{h.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        {h.device ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isOnline ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        ) : <span className="text-gray-400 text-xs font-bold">NO DEVICE</span>}
                      </td>
                      <td className="px-5 py-4">
                        {latest ? (
                          <div className="text-xs font-bold text-gray-600">
                            {latest.temperature != null ? `${latest.temperature}°C` : 'N/A'} / {latest.humidity != null ? `${latest.humidity}%` : 'N/A'}
                          </div>
                        ) : <span className="text-gray-400 text-xs">No Data</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{h.beekeeper?.name || '—'}</td>
                      <td className="px-5 py-4 font-bold">{h.batches?.length ?? 0}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => fetchHiveDetails(h.id)} className="px-3 py-1 bg-black text-white rounded text-xs font-bold hover:bg-gray-800 transition-colors">
                          VIEW DETAILS
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'iot_details' && selectedHive && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => { setActiveSection('hives'); setAiAnalysis(null); }} className="text-sm font-bold text-gray-500 hover:text-black flex items-center">
                  ← Back to Hive List
                </button>
                <button 
                  onClick={() => fetchAiAnalysis(selectedHive.id)}
                  disabled={isAnalyzing}
                  className="bg-black text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Run AI Environment Analysis'}
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex justify-between items-center shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedHive.location.toUpperCase()}</h2>
                  <p className="text-sm text-gray-500 mt-1 font-semibold">Registered: {new Date(selectedHive.registrationDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedHive.device?.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${selectedHive.device?.status === 'ONLINE' ? 'text-green-600' : 'text-red-600'}`}>{selectedHive.device?.status || 'OFFLINE'}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono font-bold">{selectedHive.device?.deviceId || 'NO DEVICE CONNECTED'}</p>
                </div>
              </div>

              {!selectedHive.current ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                  <h3 className="text-lg font-black text-red-600 mb-2">NO SENSOR READINGS AVAILABLE</h3>
                  <p className="text-red-500 font-medium">Connect the physical ESP32 device to this hive to begin monitoring.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <MetricCard label="Temperature" value={selectedHive.current.temperature != null ? `${selectedHive.current.temperature} °C` : 'N/A'} color={selectedHive.current.temperature == null ? "text-red-500" : ""} />
                  <MetricCard label="Humidity" value={selectedHive.current.humidity != null ? `${selectedHive.current.humidity} %` : 'N/A'} color={selectedHive.current.humidity == null ? "text-red-500" : ""} />
                  <MetricCard label="Pressure" value={selectedHive.current.pressure != null ? `${selectedHive.current.pressure} hPa` : 'N/A'} color={selectedHive.current.pressure == null ? "text-red-500" : ""} />
                  <MetricCard label="Rain" value={selectedHive.current.rain != null ? (selectedHive.current.rain ? 'DETECTED' : 'NO RAIN') : 'N/A'} />
                  <MetricCard label="UV" value={selectedHive.current.uv != null ? selectedHive.current.uv : 'N/A'} color={selectedHive.current.uv == null ? "text-red-500" : ""} />
                  <MetricCard label="Weight" value={selectedHive.current.weight != null ? `${selectedHive.current.weight} kg` : 'N/A'} color={selectedHive.current.weight == null ? "text-red-500" : ""} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sensor Health Status</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'DHT11', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.temperature != null ? 'ONLINE' : 'ERROR') },
                      { name: 'BMP180', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.pressure != null ? 'ONLINE' : 'ERROR') },
                      { name: 'Rain Drop', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.rain !== undefined ? 'ONLINE' : 'ERROR') },
                      { name: 'GUVA-S12SD', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.uv != null ? 'ONLINE' : 'ERROR') },
                      { name: 'Load Cell', status: selectedHive.device?.status === 'OFFLINE' ? 'NOT CONNECTED' : (selectedHive.current?.weight != null ? 'ONLINE' : 'NOT CONNECTED') },
                    ].map(s => (
                      <div key={s.name} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <span className="font-semibold text-gray-700">{s.name}</span>
                        <span className={`text-xs font-black px-2 py-1 rounded ${s.status === 'ONLINE' ? 'bg-green-100 text-green-700' : s.status === 'NOT CONNECTED' ? 'bg-orange-100 text-orange-700' : s.status === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Environment Status</h3>
                    <div className="flex flex-col items-center justify-center pt-4">
                      <span className={`text-4xl font-black mb-2 ${selectedHive.environment?.status === 'CRITICAL' ? 'text-red-600' : 'text-gray-900'}`}>{selectedHive.environment?.status || 'UNKNOWN'}</span>
                      <span className="text-sm font-bold text-gray-400">Rule-Based Score: {selectedHive.environment?.score || 0} / 100</span>
                    </div>
                  </div>
                  {aiAnalysis && aiAnalysis.success && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Data Quality</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div className="bg-black h-2 rounded-full" style={{ width: `${aiAnalysis.dataQuality?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500">{aiAnalysis.dataQuality?.validSensors} / {aiAnalysis.dataQuality?.totalSensors} sensors active</p>
                    </div>
                  )}
                </div>
              </div>

              {aiAnalysis && (
                <div className="mt-6 bg-white rounded-xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                        <span className="text-gray-900 font-black text-xs">AI</span>
                      </div>
                      <h3 className="font-black text-gray-900 tracking-wider text-sm">GROQ AI ASSESSMENT</h3>
                    </div>
                    {aiAnalysis.aiAssessment?.environmentStatus && (
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                        aiAnalysis.aiAssessment.environmentStatus === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 
                        aiAnalysis.aiAssessment.environmentStatus === 'Warning' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {aiAnalysis.aiAssessment.environmentStatus} • {aiAnalysis.aiAssessment.confidence}% CONFIDENCE
                      </span>
                    )}
                  </div>

                  {aiAnalysis.aiAssessment?.error ? (
                    <p className="text-red-500 font-bold">{aiAnalysis.aiAssessment.error}</p>
                  ) : aiAnalysis.aiAssessment?.summary ? (
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3">Executive Summary</h4>
                        <p className="text-gray-800 leading-relaxed font-medium text-sm">{aiAnalysis.aiAssessment.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                          <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Alerts & Issues</h4>
                          <ul className="space-y-3">
                            {aiAnalysis.aiAssessment.alerts?.map((a: string, i: number) => <li key={i} className="text-gray-700 text-sm flex items-start gap-3"><span className="text-red-500 font-black mt-0.5">•</span> <span>{a}</span></li>)}
                            {aiAnalysis.aiAssessment.sensorIssues?.map((a: string, i: number) => <li key={i} className="text-gray-700 text-sm flex items-start gap-3"><span className="text-orange-400 font-black mt-0.5">•</span> <span>{a}</span></li>)}
                            {(!aiAnalysis.aiAssessment.alerts?.length && !aiAnalysis.aiAssessment.sensorIssues?.length) && <li className="text-gray-400 text-sm font-semibold">No critical issues detected.</li>}
                          </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                          <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Recommended Actions</h4>
                          <ul className="space-y-3">
                            {aiAnalysis.aiAssessment.recommendations?.map((r: string, i: number) => <li key={i} className="text-gray-700 text-sm flex items-start gap-3"><span className="text-black font-black mt-0.5">→</span> <span>{r}</span></li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3">AI Reasoning</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{aiAnalysis.aiAssessment.reasoning}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 font-medium">No valid AI response generated.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'batches' && !loading && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Batch ID', 'Hive', 'Beekeeper', 'Quantity (kg)', 'Status', 'Harvest Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(Array.isArray(data) ? data : []).length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">No batches found.</td></tr>
                  ) : (Array.isArray(data) ? data : []).map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs">{b.id.slice(0,8).toUpperCase()}</td>
                      <td className="px-5 py-4 text-gray-600">{b.hive?.location || '—'}</td>
                      <td className="px-5 py-4 text-gray-600">{b.beekeeper?.name || '—'}</td>
                      <td className="px-5 py-4 font-bold">{b.quantity}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">{b.status}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{new Date(b.harvestDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'qr' && !loading && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl border border-gray-200"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Scans</p><p className="text-4xl font-black">{data?.totalScans ?? 0}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Suspicious Scans</p><p className="text-4xl font-black text-red-700">{data?.suspiciousScans ?? 0}</p></div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-sm uppercase tracking-wider">Recent QR Events</h3></div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Batch', 'City', 'Country', 'Suspicious', 'Time'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(data?.recentScans ?? []).map((s: any) => (
                      <tr key={s.id} className={`hover:bg-gray-50 ${s.isSuspicious ? 'bg-red-50/50' : ''}`}>
                        <td className="px-5 py-3 font-mono text-xs">{s.container?.batchId?.slice(0,8) || '—'}</td>
                        <td className="px-5 py-3">{s.city || '—'}</td>
                        <td className="px-5 py-3 text-gray-500">{s.country || '—'}</td>
                        <td className="px-5 py-3">
                          {s.isSuspicious ? <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">YES</span> : <span className="text-xs text-gray-400 font-semibold">No</span>}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{new Date(s.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'security' && !loading && (
            <div className="space-y-4">
              {(Array.isArray(data) ? data : []).length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-400">No active security alerts visible to KVIC.</p>
                </div>
              ) : (Array.isArray(data) ? data : []).map((a: any) => (
                <div key={a.id} className="bg-white rounded-xl border border-red-200 shadow-sm p-5 border-l-4 border-l-red-500">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-black text-sm uppercase tracking-wide">Suspicious QR Activity</span>
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">{a.riskLevel}</span>
                  </div>
                  <p className="text-sm text-gray-700">{a.reason}</p>
                  <p className="text-xs text-gray-400 mt-2">{a.previousCity} → {a.currentCity} | {a.timeDiffMinutes}m | {new Date(a.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">Contact your KVIC administrator to resolve this alert.</p>
                </div>
              ))}
            </div>
          )}

          {loading && activeSection !== 'overview' && (
            <div className="py-16 text-center text-gray-400 font-semibold">Loading…</div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold">Add Beekeeper</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBeekeeper} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Name</label>
                <input required type="text" value={newBk.name} onChange={e => setNewBk({...newBk, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email</label>
                <input required type="email" value={newBk.email} onChange={e => setNewBk({...newBk, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                <input required type="password" value={newBk.password} onChange={e => setNewBk({...newBk, password: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Farm Location</label>
                <input required type="text" value={newBk.farmLocation} onChange={e => setNewBk({...newBk, farmLocation: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Contact (Optional)</label>
                <input type="text" value={newBk.contact} onChange={e => setNewBk({...newBk, contact: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2 rounded-md hover:bg-black transition-colors mt-4">
                Register Beekeeper
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
