"use client";
import { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Users, Hexagon, BarChart3, Activity, PackageCheck, AlertTriangle, Bell, ChevronRight, CheckCircle, XCircle, Eye, Cpu, Thermometer, Droplets, Wind, Scale, Sun } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';

async function getToken(role = 'ADMIN') {
  const r = await fetch(`${API}/auth/dev-login?role=${role}`);
  const d = await r.json();
  return d.access_token as string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [secMetrics, setSecMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const [token, setToken] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [iotHives, setIotHives] = useState<any[]>([]);
  const [selectedHive, setSelectedHive] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchHiveDetails = async (id: string) => {
    try {
      const r = await fetch(`${API}/iot/hives/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      if (r.ok) {
        setSelectedHive(await r.json());
        setActiveSection('iot_details');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const load = useCallback(async () => {
    try {
      const t = await getToken('ADMIN');
      setToken(t);
      const headers = { Authorization: `Bearer ${t}` };

      const [statsRes, secRes, alertsRes, notifRes] = await Promise.all([
        fetch(`${API}/admin/dashboard`, { headers }),
        fetch(`${API}/admin/security/metrics`, { headers }),
        fetch(`${API}/admin/security/alerts`, { headers }),
        fetch(`${API}/notifications`, { headers }).catch(() => ({ ok: false, json: () => [] })),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (secRes.ok) setSecMetrics(await secRes.json());
      if (alertsRes.ok) {
        const a = await alertsRes.json();
        setAlerts(a);
      }
      if ((notifRes as any).ok) {
        const n = await (notifRes as any).json();
        setNotifications(n);
        setUnread(n.filter((x: any) => !x.read).length);
      }
      
      // Attempt to fetch all hives (or just use stats to render a placeholder list for the demo)
      const hivesRes = await fetch(`${API}/hives`, { headers });
      if (hivesRes.ok) {
        setIotHives(await hivesRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, [load]);

  const updateAlert = async (alertId: string, status: string, notes?: string) => {
    setActionLoading(alertId + status);
    try {
      await fetch(`${API}/admin/security/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      await load();
    } finally { setActionLoading(null); }
  };

  const revokeQR = async (containerId: string) => {
    setActionLoading('revoke-' + containerId);
    try {
      await fetch(`${API}/admin/security/containers/${containerId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } finally { setActionLoading(null); }
  };

  const fetchAiAnalysis = async (hiveId: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch(`${API}/iot/hives/${hiveId}/analysis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAiAnalysis(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center w-full px-4 py-3 rounded-md font-semibold text-sm transition-colors ${
        activeSection === id ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      {label}
    </button>
  );

  const MetricCard = ({ label, value, color = 'text-gray-900', accent }: any) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden`}>
      {accent && <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />}
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{value ?? 0}</p>
    </div>
  );

  const statusBadge = (s: string) => {
    const map: any = {
      OPEN: 'bg-red-100 text-red-700 border-red-200',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      RESOLVED: 'bg-green-100 text-green-700 border-green-200',
      FALSE_POSITIVE: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return <span className={`text-xs font-bold px-2 py-0.5 rounded border ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s.replace('_', ' ')}</span>;
  };



  return (
    <div className="min-h-screen bg-[#f3f4f6] flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-gray-200 shadow-sm z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-black tracking-widest uppercase text-gray-900">HoneyChain</h1>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Admin Center</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem id="overview" icon={BarChart3} label="Overview" />
          <NavItem id="security" icon={ShieldAlert} label="QR Security Center" />
          <NavItem id="alerts" icon={AlertTriangle} label="Security Alerts" />
          <NavItem id="iot" icon={Cpu} label="IoT Monitoring" />
          <NavItem id="notifications" icon={Bell} label="Notifications" />
        </nav>
        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <a href="/kvic/dashboard" className="flex items-center px-4 py-2 text-gray-500 hover:text-black text-sm font-semibold transition-colors">
            <Users className="w-4 h-4 mr-2" /> KVIC View
          </a>
          <button onClick={() => window.location.href = '/'} className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm font-semibold transition-colors w-full text-left">
            <XCircle className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide">
              {activeSection === 'overview' && 'System Overview'}
              {activeSection === 'security' && 'QR Security Center'}
              {activeSection === 'alerts' && 'Security Alerts'}
              {activeSection === 'iot' && 'Hive IoT Monitoring'}
              {activeSection === 'iot_details' && 'Hive Details'}
              {activeSection === 'notifications' && 'Notifications'}
            </h2>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-0.5">Polling every 15s</p>
          </div>
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard label="Total Honey (kg)" value={stats?.totalHoneyKg} />
                <MetricCard label="Active Batches" value={stats?.activeBatches} />
                <MetricCard label="Verified Scans" value={stats?.verifiedScans} color="text-green-700" />
                <MetricCard label="Suspicious QRs" value={stats?.suspiciousQrs} color="text-red-700" accent="bg-red-500" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard label="Total QR Codes" value={secMetrics?.totalQr} />
                <MetricCard label="Revoked QRs" value={secMetrics?.revokedQr} color="text-orange-700" accent="bg-orange-400" />
                <MetricCard label="Total Hives" value={stats?.totalHives} />
                <MetricCard label="Active IoT Devices" value={stats?.activeDevices} color="text-green-700" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard label="Open Alerts" value={secMetrics?.open} color="text-red-700" accent="bg-red-500" />
                <MetricCard label="Resolved Alerts" value={secMetrics?.resolved} color="text-green-700" />
                <MetricCard label="Hive Alerts" value={stats?.openHiveAlerts} color="text-red-700" />
              </div>
            </div>
          )}

          {/* QR SECURITY CENTER */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-5">
                <MetricCard label="Open Alerts" value={secMetrics?.open} color="text-red-700" accent="bg-red-500" />
                <MetricCard label="Under Review" value={secMetrics?.underReview} color="text-yellow-700" accent="bg-yellow-400" />
                <MetricCard label="Total Scans" value={secMetrics?.totalScans} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Suspicious QR Events</h3>
                  <span className="text-xs text-gray-400 font-semibold">{alerts.length} events</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Container', 'Batch', 'Prev Location', 'Curr Location', 'Time Diff', 'Risk', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {alerts.length === 0 ? (
                        <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-semibold">No suspicious QR activity detected.</td></tr>
                      ) : alerts.map(a => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.containerId?.slice(0,8)}…</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{a.container?.batch?.id?.slice(0,8)}…</td>
                          <td className="px-4 py-3 text-xs font-semibold">{a.previousCity || '—'}</td>
                          <td className="px-4 py-3 text-xs font-semibold">{a.currentCity || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{a.timeDiffMinutes != null ? `${a.timeDiffMinutes}m` : '—'}</td>
                          <td className="px-4 py-3"><span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded border border-red-200">{a.riskLevel}</span></td>
                          <td className="px-4 py-3">{statusBadge(a.status)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {a.status === 'OPEN' && (
                                <button onClick={() => updateAlert(a.id, 'UNDER_REVIEW')} disabled={!!actionLoading} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded transition-colors">Review</button>
                              )}
                              {(a.status === 'OPEN' || a.status === 'UNDER_REVIEW') && (
                                <>
                                  <button onClick={() => updateAlert(a.id, 'RESOLVED', 'Investigated and resolved.')} disabled={!!actionLoading} className="text-xs bg-green-100 hover:bg-green-200 text-green-800 font-bold px-2 py-1 rounded transition-colors">Resolve</button>
                                  <button onClick={() => updateAlert(a.id, 'FALSE_POSITIVE')} disabled={!!actionLoading} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded transition-colors">False +</button>
                                  <button onClick={() => revokeQR(a.containerId)} disabled={!!actionLoading} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2 py-1 rounded transition-colors">Revoke QR</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY ALERTS */}
          {activeSection === 'alerts' && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-gray-600">No active security alerts</p>
                </div>
              ) : alerts.map(a => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className={`p-5 ${a.status === 'OPEN' ? 'border-l-4 border-red-500' : a.status === 'UNDER_REVIEW' ? 'border-l-4 border-yellow-400' : 'border-l-4 border-green-400'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className={`w-4 h-4 ${a.status === 'OPEN' ? 'text-red-500' : 'text-yellow-500'}`} />
                          <span className="font-black text-sm uppercase tracking-wide">Suspicious QR Scan</span>
                          {statusBadge(a.status)}
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{a.reason}</p>
                        <p className="text-xs text-gray-400 font-semibold">
                          Container: {a.containerId?.slice(0,8)}… | {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {(a.status === 'OPEN' || a.status === 'UNDER_REVIEW') && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {a.status === 'OPEN' && <button onClick={() => updateAlert(a.id, 'UNDER_REVIEW')} className="text-xs bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-800 font-bold px-3 py-1.5 rounded-md">Mark Under Review</button>}
                        <button onClick={() => updateAlert(a.id, 'RESOLVED', 'Investigated and resolved.')} className="text-xs bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-bold px-3 py-1.5 rounded-md">Resolve</button>
                        <button onClick={() => updateAlert(a.id, 'FALSE_POSITIVE')} className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-md">False Positive</button>
                        <button onClick={() => revokeQR(a.containerId)} className="text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold px-3 py-1.5 rounded-md">Revoke QR</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-400">No notifications</p>
                </div>
              ) : notifications.map((n: any) => (
                <div key={n.id} className={`bg-white rounded-xl border ${n.read ? 'border-gray-200' : 'border-gray-300 shadow-sm'} p-5`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-black'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{n.type?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeSection === 'iot' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Registered Hives</h3>
                  <span className="text-xs text-gray-400 font-semibold">{iotHives.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Location', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {iotHives.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-semibold">No Hives found.</td></tr>
                      ) : (
                        iotHives.map(h => (
                          <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium">{h.location}</td>
                            <td className="px-4 py-3">{statusBadge(h.status)}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => fetchHiveDetails(h.id)} className="px-3 py-1 bg-black text-white rounded text-xs font-bold hover:bg-gray-800 transition-colors">
                                VIEW DETAILS
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* IOT DETAILS */}
          {activeSection === 'iot_details' && selectedHive && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => { setActiveSection('iot'); setAiAnalysis(null); }} className="text-sm font-bold text-gray-500 hover:text-black flex items-center">
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
                  <p className="text-sm text-gray-500 mt-1 font-semibold">Beekeeper: {selectedHive.beekeeper} • Registered: {new Date(selectedHive.installationDate).toLocaleDateString()}</p>
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
                            {(Array.isArray(aiAnalysis.aiAssessment.alerts) ? aiAnalysis.aiAssessment.alerts : (aiAnalysis.aiAssessment.alerts ? [aiAnalysis.aiAssessment.alerts] : [])).map((a: string, i: number) => <li key={i} className="text-gray-700 text-sm flex items-start gap-3"><span className="text-red-500 font-black mt-0.5">•</span> <span>{a}</span></li>)}
                            {(Array.isArray(aiAnalysis.aiAssessment.sensorIssues) ? aiAnalysis.aiAssessment.sensorIssues : (aiAnalysis.aiAssessment.sensorIssues ? [aiAnalysis.aiAssessment.sensorIssues] : [])).map((a: string, i: number) => <li key={i} className="text-gray-700 text-sm flex items-start gap-3"><span className="text-orange-400 font-black mt-0.5">•</span> <span>{a}</span></li>)}
                            {(!aiAnalysis.aiAssessment.alerts?.length && !aiAnalysis.aiAssessment.sensorIssues?.length) && <li className="text-gray-400 text-sm font-semibold">No critical issues detected.</li>}
                          </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                          <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Recommended Actions</h4>
                          <ul className="space-y-3">
                            {(Array.isArray(aiAnalysis.aiAssessment.recommendations) ? aiAnalysis.aiAssessment.recommendations : (aiAnalysis.aiAssessment.recommendations ? [aiAnalysis.aiAssessment.recommendations] : [])).map((r: string, i: number) => <li key={i} className="text-gray-700 text-sm flex items-start gap-3"><span className="text-black font-black mt-0.5">→</span> <span>{r}</span></li>)}
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

        </div>
      </main>
    </div>
  );
}
