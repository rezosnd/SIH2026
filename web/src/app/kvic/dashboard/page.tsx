"use client";
import { useEffect, useState } from 'react';
import { BarChart3, Users, Hexagon, Package, ShieldAlert, Activity, AlertTriangle, ChevronRight, TrendingUp, XCircle, Plus, Droplet, Search, ShieldCheck, Map, MapPin, Loader2, Cpu, Eye, CheckCircle } from 'lucide-react';

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
    fetch(`${API}${ep}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
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
      className={`flex items-center w-full px-5 py-3.5 rounded-[12px] font-semibold text-[14px] transition-all mb-1 ${
        activeSection === id ? 'bg-[#111111] text-white shadow-md' : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
      }`}
    >
      <Icon className="w-4 h-4 mr-3.5 flex-shrink-0" strokeWidth={1.8} />
      {label}
    </button>
  );

  const Stat = ({ label, value, icon: Icon, colorClass = 'text-[#111111]', dotColor }: any) => (
    <div className="bg-white p-7 rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[11px] font-bold text-[#888888] uppercase tracking-[0.08em]">{label}</p>
        {Icon && <Icon className="w-5 h-5 text-[#999999]" strokeWidth={1.8} />}
      </div>
      <div className="flex items-end gap-3">
        <p className={`text-[40px] font-bold leading-none tracking-tight ${colorClass}`}>
          {loading ? <span className="opacity-20 animate-pulse block h-[40px] w-16 bg-[#111111] rounded-md"></span> : (value ?? 0)}
        </p>
        {dotColor && !loading && <div className={`w-2 h-2 mb-2.5 rounded-full ${dotColor}`} />}
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-5"><div className="h-4 bg-[#F7F7F7] rounded w-24"></div></td>
      <td className="px-6 py-5"><div className="h-4 bg-[#F7F7F7] rounded w-32"></div></td>
      <td className="px-6 py-5"><div className="h-4 bg-[#F7F7F7] rounded w-20"></div></td>
      <td className="px-6 py-5"><div className="h-4 bg-[#F7F7F7] rounded w-12"></div></td>
      <td className="px-6 py-5"><div className="h-4 bg-[#F7F7F7] rounded w-16"></div></td>
    </tr>
  );

  const statusBadge = (s: string) => {
    const map: any = {
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      PACKAGED: 'bg-green-50 text-green-700 border-green-200',
      INACTIVE: 'bg-gray-50 text-gray-600 border-gray-200',
      OPEN: 'bg-red-50 text-red-700 border-red-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200',
    };
    return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[6px] border ${map[s] || 'bg-[#F7F7F7] text-[#555555] border-[#E7E7E7]'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex font-sans text-[#111111]">
      <aside className="w-[260px] bg-white min-h-screen flex flex-col border-r border-[#E7E7E7] z-20 sticky top-0 h-screen">
        <div className="p-8 border-b border-[#E7E7E7]">
          <h1 className="text-[18px] font-bold tracking-wide uppercase text-[#111111] flex items-center gap-2">
            <Hexagon className="w-5 h-5" strokeWidth={2} /> HoneyChain
          </h1>
          <p className="text-[10px] text-[#888888] mt-1.5 uppercase tracking-widest font-bold ml-7">KVIC Command Center</p>
        </div>
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <NavItem id="overview" icon={BarChart3} label="National Overview" />
          <NavItem id="clusters" icon={MapPin} label="Clusters" />
          <NavItem id="beekeepers" icon={Users} label="Beekeepers" />
          <NavItem id="hives" icon={Activity} label="Hives & IoT" />
          <NavItem id="batches" icon={Package} label="Production Batches" />
          <NavItem id="qr" icon={TrendingUp} label="QR Activity Monitor" />
          <NavItem id="security" icon={ShieldAlert} label="Security Alerts" />
        </nav>
        <div className="p-4 border-t border-[#E7E7E7] flex flex-col gap-1">
          <a href="/admin" className="flex items-center px-5 py-3 text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] rounded-[12px] text-[14px] font-semibold transition-colors">
            <ShieldAlert className="w-4 h-4 mr-3.5" strokeWidth={1.8} /> Admin View
          </a>
          <button onClick={handleLogout} className="flex items-center px-5 py-3 text-red-600 hover:bg-red-50 rounded-[12px] text-[14px] font-semibold transition-colors w-full text-left">
            <XCircle className="w-4 h-4 mr-3.5" strokeWidth={1.8} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-[#E7E7E7] px-8 md:px-12 py-6 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-[22px] font-bold text-[#111111] tracking-tight uppercase">
              {activeSection === 'overview' && 'NATIONAL OVERVIEW'}
              {activeSection === 'clusters' && 'CLUSTER MONITORING'}
              {activeSection === 'beekeepers' && 'BEEKEEPER REGISTRY'}
              {activeSection === 'hives' && 'NATIONAL HIVE FLEET'}
              {activeSection === 'iot_details' && 'HIVE TELEMETRY'}
              {activeSection === 'batches' && 'HONEY PRODUCTION BATCHES'}
              {activeSection === 'qr' && 'TRACEABILITY & TRUST'}
              {activeSection === 'security' && 'NATIONAL SECURITY ALERTS'}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Eye className="w-3.5 h-3.5 text-[#888888]" strokeWidth={2} />
              <p className="text-[#888888] text-[12px] font-medium tracking-wide">Read-only national monitoring view</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-[#F7F7F7] px-4 py-2 rounded-full border border-[#E7E7E7]">
            <Map className="w-4 h-4 text-[#111111]" strokeWidth={1.8} />
            <span className="text-[12px] font-bold uppercase tracking-widest text-[#111111]">KVIC Auth</span>
          </div>
        </header>

        <div className="p-8 md:p-12 max-w-[1400px] mx-auto pb-24">
          
          {activeSection === 'overview' && (
            <div className="space-y-12">
              <section>
                <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Apiary & Network Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <Stat label="Clusters" value={dashboard?.clusters} icon={MapPin} />
                  <Stat label="Beekeepers" value={dashboard?.beekeepers} icon={Users} />
                  <Stat label="Active Hives" value={dashboard?.hives} icon={Hexagon} dotColor="bg-green-500" />
                  <Stat label="Honey Batches" value={dashboard?.batches} icon={Package} />
                </div>
              </section>

              <section>
                <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Production & Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Stat label="Total Honey" value={`${dashboard?.totalHoneyKg || 0} kg`} icon={Droplet} />
                  <Stat label="Suspicious Scans" value={dashboard?.suspiciousScans} icon={ShieldAlert} dotColor={dashboard?.suspiciousScans > 0 ? "bg-red-500" : undefined} colorClass={dashboard?.suspiciousScans > 0 ? 'text-red-700' : 'text-[#111111]'} />
                  <Stat label="Open Alerts" value={dashboard?.openAlerts} icon={AlertTriangle} dotColor={dashboard?.openAlerts > 0 ? "bg-red-500" : undefined} colorClass={dashboard?.openAlerts > 0 ? 'text-red-700' : 'text-[#111111]'} />
                </div>
              </section>
            </div>
          )}

          {activeSection === 'clusters' && (
            <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white flex justify-between items-center">
                <h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">Registered KVIC Clusters</h3>
                {!loading && <span className="text-[12px] text-[#777777] font-semibold bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#E7E7E7]">{(Array.isArray(data) ? data : []).length} active</span>}
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                    <tr>
                      {['Cluster Name', 'Location', 'Beekeepers', 'Hives', 'Status'].map(h => (
                        <th key={h} className="px-8 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E7]">
                    {loading ? (
                      <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                    ) : (Array.isArray(data) ? data : []).length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-16 text-center text-[#777777] font-medium text-[14px]">No clusters found in the national registry.</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((c: any) => (
                      <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-8 py-5 font-bold text-[#111111] text-[15px]">{c.name}</td>
                        <td className="px-8 py-5 text-[#555555] font-medium text-[14px]">{c.location}</td>
                        <td className="px-8 py-5 text-[#111111] font-bold text-[14px]">{c.users?.length ?? 0}</td>
                        <td className="px-8 py-5 text-[#111111] font-bold text-[14px]">{c.hives?.length ?? 0}</td>
                        <td className="px-8 py-5"><span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[6px] border border-green-200">ACTIVE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'beekeepers' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white flex justify-between items-center">
                  <h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">Registered Beekeepers</h3>
                  <button onClick={() => setShowAddModal(true)} className="bg-[#111111] text-white px-5 py-2.5 rounded-[10px] font-semibold text-[13px] hover:bg-[#222222] transition-all active:scale-[0.98] flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-1.5" strokeWidth={2} /> Add Beekeeper
                  </button>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                      <tr>
                        {['Name', 'Farm Location', 'Cluster', 'Hives', 'Batches', 'Contact'].map(h => (
                          <th key={h} className="px-8 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E7E7]">
                      {loading ? (
                        <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                      ) : (Array.isArray(data) ? data : []).length === 0 ? (
                        <tr><td colSpan={6} className="px-8 py-16 text-center text-[#777777] font-medium text-[14px]">No beekeepers registered.</td></tr>
                      ) : (Array.isArray(data) ? data : []).map((b: any) => (
                        <tr key={b.id} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-8 py-5 font-bold text-[#111111] text-[14px]">{b.name}</td>
                          <td className="px-8 py-5 text-[#555555] font-medium text-[14px]">{b.farmLocation || '—'}</td>
                          <td className="px-8 py-5 text-[#555555] font-medium text-[14px]">{b.user?.cluster?.name || '—'}</td>
                          <td className="px-8 py-5 text-[#111111] font-bold text-[14px]">{b.hives?.length ?? 0}</td>
                          <td className="px-8 py-5 text-[#111111] font-bold text-[14px]">{b.batches?.length ?? 0}</td>
                          <td className="px-8 py-5 text-[#777777] text-[13px]">{b.contact || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'hives' && (
            <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white flex justify-between items-center">
                <h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">National Hive Network</h3>
                {!loading && <span className="text-[12px] text-[#777777] font-semibold bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#E7E7E7]">{(Array.isArray(data) ? data : []).length} registered</span>}
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                    <tr>
                      {['Location', 'Status', 'IoT Link', 'Environment', 'Beekeeper', 'Batches', 'Actions'].map(h => (
                        <th key={h} className="px-8 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E7]">
                    {loading ? (
                      <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                    ) : (Array.isArray(data) ? data : []).length === 0 ? (
                      <tr><td colSpan={7} className="px-8 py-16 text-center text-[#777777] font-medium text-[14px]">No hives registered.</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((h: any) => {
                      const isOnline = h.device?.lastSeenAt && (new Date().getTime() - new Date(h.device.lastSeenAt).getTime() < 120000);
                      const latest = h.sensorReadings?.[0];
                      return (
                        <tr key={h.id} className="hover:bg-[#FAFAFA] transition-colors group">
                          <td className="px-8 py-5 font-bold text-[#111111] text-[14px]">{h.location}</td>
                          <td className="px-8 py-5">{statusBadge(h.status)}</td>
                          <td className="px-8 py-5">
                            {h.device ? (
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[6px] border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                              </span>
                            ) : <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] bg-[#F7F7F7] px-2.5 py-1 rounded-[6px] border border-[#E7E7E7]">UNLINKED</span>}
                          </td>
                          <td className="px-8 py-5">
                            {latest ? (
                              <div className="text-[13px] font-bold text-[#444444]">
                                {latest.temperature != null ? `${latest.temperature}°C` : '—'} / {latest.humidity != null ? `${latest.humidity}%` : '—'}
                              </div>
                            ) : <span className="text-[#888888] text-[13px] font-medium">No telemetry</span>}
                          </td>
                          <td className="px-8 py-5 text-[#555555] font-medium text-[14px]">{h.beekeeper?.name || '—'}</td>
                          <td className="px-8 py-5 text-[#111111] font-bold text-[14px]">{h.batches?.length ?? 0}</td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <button onClick={() => fetchHiveDetails(h.id)} className="inline-flex items-center text-[13px] font-semibold text-[#111111] hover:underline underline-offset-4 group-hover:text-black transition-all">
                              Inspect <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* IOT DETAILS */}
          {activeSection === 'iot_details' && selectedHive && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => { setActiveSection('hives'); setAiAnalysis(null); }} className="text-[13px] font-bold text-[#666666] hover:text-[#111111] flex items-center transition-colors">
                  ← Back to National Fleet
                </button>
                <button 
                  onClick={() => fetchAiAnalysis(selectedHive.id)}
                  disabled={isAnalyzing}
                  className="bg-[#111111] text-white px-5 py-2.5 rounded-[10px] font-semibold text-[13px] hover:bg-[#222222] transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-[#999999]"
                >
                  {isAnalyzing ? 'Running AI Assessment...' : 'Run AI Environment Analysis'}
                </button>
              </div>
              
              <div className="bg-white rounded-[20px] border border-[#E7E7E7] p-8 flex flex-col md:flex-row md:justify-between md:items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-6">
                <div>
                  <p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1.5">Hive Location</p>
                  <h2 className="text-[26px] font-bold text-[#111111] leading-tight mb-2">{selectedHive.location.toUpperCase()}</h2>
                  <p className="text-[14px] text-[#555555] font-medium">Registered: {new Date(selectedHive.registrationDate).toLocaleDateString()}</p>
                </div>
                <div className="md:text-right bg-[#F7F7F7] px-6 py-4 rounded-[14px] border border-[#E7E7E7]">
                  <p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-2 md:justify-end flex">Telemetry Status</p>
                  <div className="flex items-center gap-2 mb-1.5 md:justify-end">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedHive.device?.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-[13px] font-bold uppercase tracking-wide ${selectedHive.device?.status === 'ONLINE' ? 'text-green-700' : 'text-red-700'}`}>{selectedHive.device?.status || 'OFFLINE'}</span>
                  </div>
                  <p className="text-[12px] text-[#555555] font-mono font-medium">{selectedHive.device?.deviceId || 'No controller assigned'}</p>
                </div>
              </div>

              {!selectedHive.current ? (
                <div className="bg-white border border-[#E7E7E7] rounded-[20px] p-16 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <Activity className="w-12 h-12 text-[#E7E7E7] mb-5" strokeWidth={1.5} />
                  <h3 className="text-[18px] font-bold text-[#111111] mb-2">No Telemetry Data</h3>
                  <p className="text-[#666666] font-medium text-[14px]">Connect a physical ESP32 controller to receive environment data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-5 rounded-[16px] border border-[#E7E7E7]"><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Temp</p><p className={`text-[20px] font-black ${selectedHive.current.temperature == null ? 'text-red-600' : 'text-[#111111]'}`}>{selectedHive.current.temperature != null ? `${selectedHive.current.temperature}°C` : 'N/A'}</p></div>
                  <div className="bg-white p-5 rounded-[16px] border border-[#E7E7E7]"><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Humidity</p><p className={`text-[20px] font-black ${selectedHive.current.humidity == null ? 'text-red-600' : 'text-[#111111]'}`}>{selectedHive.current.humidity != null ? `${selectedHive.current.humidity}%` : 'N/A'}</p></div>
                  <div className="bg-white p-5 rounded-[16px] border border-[#E7E7E7]"><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Pressure</p><p className={`text-[20px] font-black ${selectedHive.current.pressure == null ? 'text-red-600' : 'text-[#111111]'}`}>{selectedHive.current.pressure != null ? `${selectedHive.current.pressure}hPa` : 'N/A'}</p></div>
                  <div className="bg-white p-5 rounded-[16px] border border-[#E7E7E7]"><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Rain</p><p className="text-[20px] font-black text-[#111111]">{selectedHive.current.rain != null ? (selectedHive.current.rain ? 'YES' : 'NO') : 'N/A'}</p></div>
                  <div className="bg-white p-5 rounded-[16px] border border-[#E7E7E7]"><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">UV Index</p><p className={`text-[20px] font-black ${selectedHive.current.uv == null ? 'text-red-600' : 'text-[#111111]'}`}>{selectedHive.current.uv != null ? selectedHive.current.uv : 'N/A'}</p></div>
                  <div className="bg-white p-5 rounded-[16px] border border-[#E7E7E7]"><p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">Weight</p><p className={`text-[20px] font-black ${selectedHive.current.weight == null ? 'text-red-600' : 'text-[#111111]'}`}>{selectedHive.current.weight != null ? `${selectedHive.current.weight}kg` : 'N/A'}</p></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#E7E7E7] p-8">
                  <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Sensor Health Matrix</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'DHT11 Temperature & Humidity', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.temperature != null ? 'ONLINE' : 'ERROR') },
                      { name: 'BMP180 Barometric Pressure', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.pressure != null ? 'ONLINE' : 'ERROR') },
                      { name: 'Rain Drop Sensor', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.rain !== undefined ? 'ONLINE' : 'ERROR') },
                      { name: 'GUVA-S12SD UV', status: selectedHive.device?.status === 'OFFLINE' ? 'OFFLINE' : (selectedHive.current?.uv != null ? 'ONLINE' : 'ERROR') },
                      { name: 'HX711 Load Cell', status: selectedHive.device?.status === 'OFFLINE' ? 'NOT CONNECTED' : (selectedHive.current?.weight != null ? 'ONLINE' : 'NOT CONNECTED') },
                    ].map(s => (
                      <div key={s.name} className="flex justify-between items-center pb-3 border-b border-[#F7F7F7] last:border-0 last:pb-0">
                        <span className="font-medium text-[14px] text-[#444444]">{s.name}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-[6px] tracking-wider uppercase border ${s.status === 'ONLINE' ? 'bg-green-50 text-green-700 border-green-200' : s.status === 'NOT CONNECTED' ? 'bg-amber-50 text-amber-700 border-amber-200' : s.status === 'ERROR' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#E7E7E7] p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Environment Validation</h3>
                    <div className="flex flex-col items-center justify-center pt-2">
                      <span className={`text-[46px] font-bold leading-none mb-3 ${selectedHive.environment?.status === 'CRITICAL' ? 'text-red-600' : 'text-[#111111]'}`}>{selectedHive.environment?.status || 'UNKNOWN'}</span>
                      <span className="text-[13px] font-bold text-[#666666] bg-[#F7F7F7] px-4 py-1.5 rounded-full border border-[#E7E7E7]">Rule-Based Score: {selectedHive.environment?.score || 0} / 100</span>
                    </div>
                  </div>
                  {aiAnalysis && aiAnalysis.success && (
                    <div className="mt-8 pt-6 border-t border-[#E7E7E7]">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[11px] font-bold text-[#888888] uppercase tracking-widest">Data Integrity</p>
                        <p className="text-[11px] font-bold text-[#111111]">{aiAnalysis.dataQuality?.validSensors} / {aiAnalysis.dataQuality?.totalSensors} active</p>
                      </div>
                      <div className="w-full bg-[#E7E7E7] rounded-full h-2 mb-1 overflow-hidden">
                        <div className="bg-[#111111] h-2 rounded-full" style={{ width: `${aiAnalysis.dataQuality?.percentage || 0}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {aiAnalysis && (
                <div className="mt-8 bg-white rounded-[20px] p-8 border border-[#E7E7E7] shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#111111]"></div>
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 border-b border-[#E7E7E7] pb-6 gap-4 mt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[#111111] flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-[18px] text-[#111111] tracking-tight">GROQ AI ASSESSMENT</h3>
                    </div>
                    {aiAnalysis.aiAssessment?.environmentStatus && (
                      <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-[8px] border inline-flex items-center gap-2 ${
                        aiAnalysis.aiAssessment.environmentStatus === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 
                        aiAnalysis.aiAssessment.environmentStatus === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${aiAnalysis.aiAssessment.environmentStatus === 'Critical' ? 'bg-red-500' : aiAnalysis.aiAssessment.environmentStatus === 'Warning' ? 'bg-amber-500' : 'bg-green-500'}`} />
                        {aiAnalysis.aiAssessment.environmentStatus} • {aiAnalysis.aiAssessment.confidence}% CONFIDENCE
                      </div>
                    )}
                  </div>

                  {aiAnalysis.aiAssessment?.error ? (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-[12px]">
                      <p className="text-red-700 font-bold text-[14px]">{aiAnalysis.aiAssessment.error}</p>
                    </div>
                  ) : aiAnalysis.aiAssessment?.summary ? (
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[#888888] font-bold uppercase tracking-[0.1em] text-[11px] mb-3">Executive Summary</h4>
                        <p className="text-[#222222] leading-relaxed font-medium text-[15px]">{aiAnalysis.aiAssessment.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FAFAFA] rounded-[16px] p-7 border border-[#E7E7E7]">
                          <h4 className="text-[#888888] font-bold uppercase tracking-[0.1em] text-[11px] mb-5">Alerts & Irregularities</h4>
                          <ul className="space-y-4">
                            {(Array.isArray(aiAnalysis.aiAssessment.alerts) ? aiAnalysis.aiAssessment.alerts : (aiAnalysis.aiAssessment.alerts ? [aiAnalysis.aiAssessment.alerts] : [])).map((a: string, i: number) => <li key={i} className="text-[#444444] text-[14px] flex items-start gap-3"><span className="text-red-500 font-black mt-0.5">•</span> <span className="leading-snug">{a}</span></li>)}
                            {(Array.isArray(aiAnalysis.aiAssessment.sensorIssues) ? aiAnalysis.aiAssessment.sensorIssues : (aiAnalysis.aiAssessment.sensorIssues ? [aiAnalysis.aiAssessment.sensorIssues] : [])).map((a: string, i: number) => <li key={i} className="text-[#444444] text-[14px] flex items-start gap-3"><span className="text-amber-500 font-black mt-0.5">•</span> <span className="leading-snug">{a}</span></li>)}
                            {(!aiAnalysis.aiAssessment.alerts?.length && !aiAnalysis.aiAssessment.sensorIssues?.length) && <li className="text-[#777777] text-[14px] font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> No anomalies detected.</li>}
                          </ul>
                        </div>
                        <div className="bg-[#111111] rounded-[16px] p-7 border border-[#222222]">
                          <h4 className="text-[#888888] font-bold uppercase tracking-[0.1em] text-[11px] mb-5">Recommended Actions</h4>
                          <ul className="space-y-4">
                            {(Array.isArray(aiAnalysis.aiAssessment.recommendations) ? aiAnalysis.aiAssessment.recommendations : (aiAnalysis.aiAssessment.recommendations ? [aiAnalysis.aiAssessment.recommendations] : [])).map((r: string, i: number) => <li key={i} className="text-white text-[14px] flex items-start gap-3"><span className="text-[#888888] font-black mt-0.5">→</span> <span className="leading-snug">{r}</span></li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#E7E7E7]">
                        <h4 className="text-[#888888] font-bold uppercase tracking-[0.1em] text-[11px] mb-3">Logical Reasoning Matrix</h4>
                        <p className="text-[#666666] text-[14px] leading-relaxed">{aiAnalysis.aiAssessment.reasoning}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F7F7F7] border border-[#E7E7E7] p-6 rounded-[12px]">
                      <p className="text-[#666666] font-medium text-[14px]">Analysis payload was empty or malformed.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'batches' && (
            <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white flex justify-between items-center">
                <h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">Honey Production Batches</h3>
                {!loading && <span className="text-[12px] text-[#777777] font-semibold bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#E7E7E7]">{(Array.isArray(data) ? data : []).length} batches total</span>}
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                    <tr>
                      {['Batch ID', 'Hive', 'Beekeeper', 'Quantity', 'Status', 'Harvest Date'].map(h => (
                        <th key={h} className="px-8 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E7]">
                    {loading ? (
                      <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                    ) : (Array.isArray(data) ? data : []).length === 0 ? (
                      <tr><td colSpan={6} className="px-8 py-16 text-center text-[#777777] font-medium text-[14px]">No batches found.</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((b: any) => (
                      <tr key={b.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-8 py-5 font-mono text-[14px] font-bold text-[#111111]">{b.id.slice(0,8).toUpperCase()}</td>
                        <td className="px-8 py-5 text-[#555555] font-medium text-[14px]">{b.hive?.location || '—'}</td>
                        <td className="px-8 py-5 text-[#555555] font-medium text-[14px]">{b.beekeeper?.name || '—'}</td>
                        <td className="px-8 py-5 text-[#111111] font-bold text-[14px]">{b.quantity} kg</td>
                        <td className="px-8 py-5">{statusBadge(b.status)}</td>
                        <td className="px-8 py-5 text-[#777777] text-[13px]">{new Date(b.harvestDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'qr' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Stat label="Total National Scans" value={data?.totalScans ?? 0} icon={Search} />
                <Stat label="Suspicious Operations" value={data?.suspiciousScans ?? 0} icon={ShieldAlert} dotColor={data?.suspiciousScans > 0 ? "bg-red-500" : undefined} colorClass={data?.suspiciousScans > 0 ? 'text-red-700' : 'text-[#111111]'} />
              </div>

              <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white"><h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">Recent Traceability Events</h3></div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                      <tr>
                        {['Container', 'City', 'Country', 'Integrity', 'Timestamp'].map(h => (
                          <th key={h} className="px-8 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E7E7]">
                      {loading ? (
                        <><SkeletonRow /><SkeletonRow /></>
                      ) : (data?.recentScans ?? []).map((s: any) => (
                        <tr key={s.id} className={`hover:bg-[#FAFAFA] transition-colors ${s.isSuspicious ? 'bg-red-50/30' : ''}`}>
                          <td className="px-8 py-5 font-mono text-[13px] font-semibold text-[#111111]">{s.container?.id?.slice(0,8) || '—'}</td>
                          <td className="px-8 py-5 text-[#222222] font-medium text-[14px]">{s.city || '—'}</td>
                          <td className="px-8 py-5 text-[#777777] text-[13px]">{s.country || '—'}</td>
                          <td className="px-8 py-5">
                            {s.isSuspicious ? <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-[6px] border border-red-200">SUSPICIOUS</span> : <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-[6px] border border-green-200">VERIFIED</span>}
                          </td>
                          <td className="px-8 py-5 text-[#777777] text-[13px]">{new Date(s.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {loading ? (
                 <div className="py-16 text-center text-[#A0A0A0] font-semibold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading alerts...</div>
              ) : (Array.isArray(data) ? data : []).length === 0 ? (
                <div className="bg-white rounded-[18px] p-16 text-center border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <ShieldCheck className="w-14 h-14 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="font-bold text-[18px] text-[#111111] mb-2">No Security Incidents</h3>
                  <p className="font-medium text-[#777777] text-[14px]">No active security alerts require KVIC attention at this time.</p>
                </div>
              ) : (Array.isArray(data) ? data : []).map((a: any) => (
                <div key={a.id} className="bg-white rounded-[16px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className={`p-6 md:p-8 flex flex-col relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-red-500`}>
                    <div className="ml-2">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.8} />
                        <span className="font-bold text-[14px] uppercase tracking-widest text-[#111111]">Suspicious Supply Chain Activity</span>
                        <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-[6px] border border-red-200">{a.riskLevel}</span>
                      </div>
                      <p className="text-[15px] text-[#444444] mb-3 leading-relaxed">{a.reason}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold text-[#888888] uppercase tracking-widest bg-[#F7F7F7] p-3 rounded-[10px] border border-[#E7E7E7] w-fit">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {a.previousCity || 'Unknown'} → {a.currentCity || 'Unknown'}</span>
                        <span>•</span>
                        <span>{a.timeDiffMinutes != null ? `${a.timeDiffMinutes}m travel diff` : '—'}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                         <p className="text-[12px] text-[#A0A0A0]">{new Date(a.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                         <p className="text-[11px] font-bold text-[#666666] bg-[#F7F7F7] px-3 py-1.5 rounded-md">Action required by system administrator</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md overflow-hidden border border-[#E7E7E7] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E7E7E7] flex justify-between items-center bg-[#FAFAFA]">
              <h2 className="font-bold text-[18px] text-[#111111]">Register Beekeeper</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#888888] hover:text-[#111111] transition-colors bg-white rounded-full p-1 border border-[#E7E7E7]">
                <XCircle className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleAddBeekeeper} className="p-8 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-[#888888] mb-2 uppercase tracking-widest">Full Name</label>
                <input required type="text" value={newBk.name} onChange={e => setNewBk({...newBk, name: e.target.value})} className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[10px] focus:outline-none focus:border-[#111111] text-[14px] transition-colors bg-[#FAFAFA] focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#888888] mb-2 uppercase tracking-widest">Email Address</label>
                <input required type="email" value={newBk.email} onChange={e => setNewBk({...newBk, email: e.target.value})} className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[10px] focus:outline-none focus:border-[#111111] text-[14px] transition-colors bg-[#FAFAFA] focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#888888] mb-2 uppercase tracking-widest">Password</label>
                <input required type="password" value={newBk.password} onChange={e => setNewBk({...newBk, password: e.target.value})} className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[10px] focus:outline-none focus:border-[#111111] text-[14px] transition-colors bg-[#FAFAFA] focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#888888] mb-2 uppercase tracking-widest">Farm Location</label>
                <input required type="text" value={newBk.farmLocation} onChange={e => setNewBk({...newBk, farmLocation: e.target.value})} className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[10px] focus:outline-none focus:border-[#111111] text-[14px] transition-colors bg-[#FAFAFA] focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#888888] mb-2 uppercase tracking-widest">Contact <span className="opacity-50">(Optional)</span></label>
                <input type="text" value={newBk.contact} onChange={e => setNewBk({...newBk, contact: e.target.value})} className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[10px] focus:outline-none focus:border-[#111111] text-[14px] transition-colors bg-[#FAFAFA] focus:bg-white" />
              </div>
              <button type="submit" className="w-full bg-[#111111] text-white font-bold py-3.5 rounded-[12px] hover:bg-[#222222] transition-all active:scale-[0.98] mt-4 text-[14px]">
                Confirm Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
