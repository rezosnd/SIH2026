"use client";
import { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, QrCode, Ban, Users, Hexagon, BarChart3, Activity, PackageCheck, AlertTriangle, Bell, ChevronRight, CheckCircle, XCircle, Eye, Cpu, Thermometer, Droplets, Wind, Scale, Sun, Droplet, Package, Settings, Database, ActivitySquare, Ban as BanIcon } from 'lucide-react';

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
      className={`flex items-center w-full px-5 py-3.5 rounded-[12px] font-semibold text-[14px] transition-all mb-1 ${
        activeSection === id ? 'bg-[#111111] text-white' : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
      }`}
    >
      <Icon className="w-4 h-4 mr-3.5 flex-shrink-0" strokeWidth={1.8} />
      {label}
    </button>
  );

  const MetricCard = ({ label, value, icon: Icon, statusColor }: any) => (
    <div className={`bg-white p-7 rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]`}>
      <div className="flex justify-between items-start mb-6">
        <p className="text-[11px] font-bold text-[#888888] uppercase tracking-[0.08em]">{label}</p>
        {Icon && <Icon className="w-5 h-5 text-[#999999]" strokeWidth={1.8} />}
      </div>
      <div className="flex items-end gap-3">
        <p className="text-[40px] font-bold text-[#000000] leading-none tracking-tight">{value ?? 0}</p>
        {statusColor && <div className={`w-2 h-2 mb-2.5 rounded-full ${statusColor}`} />}
      </div>
    </div>
  );

  const statusBadge = (s: string) => {
    const map: any = {
      OPEN: 'bg-red-50 text-red-700 border-red-200',
      UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200',
      FALSE_POSITIVE: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[6px] border ${map[s] || 'bg-gray-50 text-gray-600 border-[#E7E7E7]'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex font-sans text-[#111111]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white min-h-screen flex flex-col border-r border-[#E7E7E7] z-20 sticky top-0 h-screen">
        <div className="p-8 border-b border-[#E7E7E7]">
          <h1 className="text-[18px] font-bold tracking-wide uppercase text-[#111111] flex items-center gap-2">
            <Hexagon className="w-5 h-5" strokeWidth={2} /> HoneyChain
          </h1>
          <p className="text-[10px] text-[#888888] mt-1.5 uppercase tracking-widest font-bold ml-7">Admin Center</p>
        </div>
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <NavItem id="overview" icon={BarChart3} label="Overview" />
          <NavItem id="security" icon={ShieldAlert} label="QR Security" />
          <NavItem id="alerts" icon={AlertTriangle} label="Security Alerts" />
          <NavItem id="iot" icon={Cpu} label="IoT Monitoring" />
          <NavItem id="notifications" icon={Bell} label="Notifications" />
        </nav>
        <div className="p-4 border-t border-[#E7E7E7] flex flex-col gap-1">
          <a href="/kvic/dashboard" className="flex items-center px-5 py-3 text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] rounded-[12px] text-[14px] font-semibold transition-colors">
            <Users className="w-4 h-4 mr-3.5" strokeWidth={1.8} /> KVIC View
          </a>
          <button onClick={() => window.location.href = '/'} className="flex items-center px-5 py-3 text-red-600 hover:bg-red-50 rounded-[12px] text-[14px] font-semibold transition-colors w-full text-left">
            <XCircle className="w-4 h-4 mr-3.5" strokeWidth={1.8} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E7E7E7] px-8 md:px-12 py-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-[22px] font-bold text-[#111111] tracking-tight">
              {activeSection === 'overview' && 'SYSTEM OVERVIEW'}
              {activeSection === 'security' && 'QR SECURITY CENTER'}
              {activeSection === 'alerts' && 'SECURITY ALERTS'}
              {activeSection === 'iot' && 'IOT SYSTEM HEALTH'}
              {activeSection === 'iot_details' && 'HIVE IOT DETAILS'}
              {activeSection === 'notifications' && 'SYSTEM NOTIFICATIONS'}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[#777777] text-[12px] font-medium tracking-wide">Live monitoring • Auto-refreshes every 15s</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#E7E7E7]">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">System Secure</span>
            </div>
            <button onClick={() => setActiveSection('notifications')} className="relative p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
              <Bell className="w-5 h-5 text-[#555555]" strokeWidth={1.8} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{unread}</span>
              )}
            </button>
          </div>
        </header>

        <div className="p-8 md:p-12 max-w-[1400px] mx-auto pb-24">
          
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className="space-y-12">
              
              <section>
                <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Production & Operations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <MetricCard label="Total Honey" value={`${stats?.totalHoneyKg || 0} kg`} icon={Droplet} />
                  <MetricCard label="Active Batches" value={stats?.activeBatches} icon={Package} statusColor="bg-amber-400" />
                  <MetricCard label="Total Hives" value={stats?.totalHives} icon={Hexagon} />
                  <MetricCard label="IoT Devices" value={stats?.activeDevices} icon={Cpu} statusColor="bg-green-500" />
                </div>
              </section>

              <section>
                <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Traceability & Trust</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <MetricCard label="Total QR Codes" value={secMetrics?.totalQr} icon={QrCode} />
                  <MetricCard label="Verified Scans" value={stats?.verifiedScans} icon={ShieldCheck} statusColor="bg-green-500" />
                  <MetricCard label="Suspicious Scans" value={stats?.suspiciousQrs} icon={ShieldAlert} statusColor={stats?.suspiciousQrs > 0 ? "bg-red-500" : "bg-[#E7E7E7]"} />
                  <MetricCard label="Revoked QR" value={secMetrics?.revokedQr} icon={BanIcon} statusColor={secMetrics?.revokedQr > 0 ? "bg-red-500" : "bg-[#E7E7E7]"} />
                </div>
              </section>

              <section>
                <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-[0.1em] mb-6 border-b border-[#E7E7E7] pb-3">Security Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <MetricCard label="Open Alerts" value={secMetrics?.open} icon={AlertTriangle} statusColor={secMetrics?.open > 0 ? "bg-red-500" : "bg-[#E7E7E7]"} />
                  <MetricCard label="Hive IoT Alerts" value={stats?.openHiveAlerts} icon={ActivitySquare} statusColor={stats?.openHiveAlerts > 0 ? "bg-red-500" : "bg-[#E7E7E7]"} />
                  <MetricCard label="Resolved" value={secMetrics?.resolved} icon={CheckCircle} statusColor="bg-green-500" />
                </div>
              </section>

            </div>
          )}

          {/* QR SECURITY CENTER */}
          {activeSection === 'security' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <MetricCard label="Open Security Alerts" value={secMetrics?.open} icon={AlertTriangle} statusColor={secMetrics?.open > 0 ? "bg-red-500" : "bg-[#E7E7E7]"} />
                <MetricCard label="Under Review" value={secMetrics?.underReview} icon={Eye} statusColor={secMetrics?.underReview > 0 ? "bg-amber-400" : "bg-[#E7E7E7]"} />
                <MetricCard label="Total Platform Scans" value={secMetrics?.totalScans} icon={QrCode} />
              </div>

              <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white flex items-center justify-between">
                  <h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">Suspicious QR Events</h3>
                  <span className="text-[12px] text-[#777777] font-semibold bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#E7E7E7]">{alerts.length} events recorded</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                      <tr>
                        {['Container', 'Batch', 'Prev Location', 'Curr Location', 'Time', 'Risk', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E7E7]">
                      {alerts.length === 0 ? (
                        <tr><td colSpan={8} className="px-6 py-16 text-center text-[#777777] font-medium text-[14px]">No suspicious QR activity detected across the network.</td></tr>
                      ) : alerts.map(a => (
                        <tr key={a.id} className="hover:bg-[#FAFAFA] transition-colors group">
                          <td className="px-6 py-5 font-mono text-[13px] text-[#111111] font-semibold">{a.containerId?.slice(0,8)}…</td>
                          <td className="px-6 py-5 text-[13px] text-[#555555] font-mono">{a.container?.batch?.id?.slice(0,8)}…</td>
                          <td className="px-6 py-5 text-[13px] text-[#222222] font-medium">{a.previousCity || '—'}</td>
                          <td className="px-6 py-5 text-[13px] text-[#222222] font-medium">{a.currentCity || '—'}</td>
                          <td className="px-6 py-5 text-[13px] text-[#777777]">{a.timeDiffMinutes != null ? `${a.timeDiffMinutes}m diff` : '—'}</td>
                          <td className="px-6 py-5"><span className="bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-red-100">{a.riskLevel}</span></td>
                          <td className="px-6 py-5">{statusBadge(a.status)}</td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2">
                              {a.status === 'OPEN' && (
                                <button onClick={() => updateAlert(a.id, 'UNDER_REVIEW')} disabled={!!actionLoading} className="text-[12px] bg-white border border-[#E7E7E7] hover:bg-[#F7F7F7] text-[#111111] font-semibold px-3 py-1.5 rounded-[8px] transition-all">Review</button>
                              )}
                              {(a.status === 'OPEN' || a.status === 'UNDER_REVIEW') && (
                                <>
                                  <button onClick={() => updateAlert(a.id, 'RESOLVED', 'Investigated and resolved.')} disabled={!!actionLoading} className="text-[12px] bg-green-50 border border-green-200 hover:bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded-[8px] transition-all">Resolve</button>
                                  <button onClick={() => revokeQR(a.containerId)} disabled={!!actionLoading} className="text-[12px] bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-semibold px-3 py-1.5 rounded-[8px] transition-all">Revoke</button>
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

          {/* SECURITY ALERTS FEED */}
          {activeSection === 'alerts' && (
            <div className="max-w-4xl mx-auto space-y-5 mt-4">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-[18px] p-16 text-center border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <ShieldCheck className="w-14 h-14 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="font-bold text-[18px] text-[#111111] mb-2">No Active Security Alerts</h3>
                  <p className="font-medium text-[#777777] text-[14px]">The system is operating securely with no anomalies detected.</p>
                </div>
              ) : alerts.map(a => (
                <div key={a.id} className="bg-white rounded-[16px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className={`p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative ${a.status === 'OPEN' ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-red-500' : a.status === 'UNDER_REVIEW' ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-amber-400' : 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-green-500'}`}>
                    <div className="flex-1 ml-2">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <AlertTriangle className={`w-5 h-5 ${a.status === 'OPEN' ? 'text-red-500' : 'text-amber-500'}`} strokeWidth={1.8} />
                        <span className="font-bold text-[14px] uppercase tracking-widest text-[#111111]">Suspicious QR Scan Activity</span>
                        {statusBadge(a.status)}
                      </div>
                      <p className="text-[15px] text-[#444444] mb-3 leading-relaxed">{a.reason}</p>
                      <div className="flex items-center gap-4 text-[12px] font-bold text-[#888888] uppercase tracking-widest">
                        <span>Container <span className="font-mono text-[#555555] bg-[#F7F7F7] px-1.5 py-0.5 rounded border border-[#E7E7E7]">{a.containerId?.slice(0,8)}</span></span>
                        <span>•</span>
                        <span>{new Date(a.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {(a.status === 'OPEN' || a.status === 'UNDER_REVIEW') && (
                      <div className="flex flex-wrap md:flex-col gap-2 md:min-w-[140px] ml-2 md:ml-0">
                        {a.status === 'OPEN' && <button onClick={() => updateAlert(a.id, 'UNDER_REVIEW')} className="w-full text-left text-[12px] bg-white hover:bg-[#F7F7F7] border border-[#E7E7E7] text-[#111111] font-semibold px-4 py-2.5 rounded-[8px] transition-all">Review Issue</button>}
                        <button onClick={() => updateAlert(a.id, 'RESOLVED', 'Investigated and resolved.')} className="w-full text-left text-[12px] bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-semibold px-4 py-2.5 rounded-[8px] transition-all">Mark Resolved</button>
                        <button onClick={() => revokeQR(a.containerId)} className="w-full text-left text-[12px] bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold px-4 py-2.5 rounded-[8px] transition-all">Revoke QR Code</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="max-w-3xl mx-auto space-y-4 mt-4">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-[18px] p-16 text-center border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <Bell className="w-12 h-12 text-[#E7E7E7] mx-auto mb-4" strokeWidth={1.5} />
                  <p className="font-medium text-[#777777] text-[14px]">No system notifications at this time.</p>
                </div>
              ) : notifications.map((n: any) => (
                <div key={n.id} className={`bg-white rounded-[16px] border ${n.read ? 'border-[#E7E7E7]' : 'border-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.05)]'} p-6 transition-all`}>
                  <div className="flex items-start gap-5">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-[#E7E7E7]' : 'bg-[#111111]'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <p className={`font-bold text-[15px] ${n.read ? 'text-[#555555]' : 'text-[#111111]'}`}>{n.title}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#888888] bg-[#F7F7F7] px-2.5 py-1 rounded-[6px] border border-[#E7E7E7]">{n.type?.replace(/_/g, ' ')}</span>
                      </div>
                      <p className={`text-[14px] leading-relaxed mb-3 ${n.read ? 'text-[#888888]' : 'text-[#444444]'}`}>{n.message}</p>
                      <p className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider">{new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* IOT MONITORING */}
          {activeSection === 'iot' && (
            <div className="space-y-8">
              <div className="bg-white rounded-[18px] border border-[#E7E7E7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden mt-4">
                <div className="px-8 py-6 border-b border-[#E7E7E7] bg-white flex items-center justify-between">
                  <h3 className="font-bold text-[14px] uppercase tracking-[0.08em] text-[#111111]">Registered Smart Hives</h3>
                  <span className="text-[12px] text-[#777777] font-semibold bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#E7E7E7]">{iotHives.length} active hives</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-[#FAFAFA] border-b border-[#E7E7E7]">
                      <tr>
                        {['Hive Location', 'Cluster', 'IoT Status', 'Actions'].map((h, i) => (
                          <th key={i} className={`px-8 py-4 text-[11px] font-bold text-[#888888] uppercase tracking-widest whitespace-nowrap ${i===3 ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E7E7]">
                      {iotHives.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-[#777777] font-medium text-[14px]">No registered IoT hives found in the network.</td></tr>
                      ) : (
                        iotHives.map(h => (
                          <tr key={h.id} className="hover:bg-[#FAFAFA] transition-colors group">
                            <td className="px-8 py-5 font-semibold text-[#111111] text-[14px] whitespace-nowrap">{h.location}</td>
                            <td className="px-8 py-5 text-[#555555] text-[14px] whitespace-nowrap">{h.cluster?.name || 'Unassigned'}</td>
                            <td className="px-8 py-5 whitespace-nowrap">{statusBadge(h.status)}</td>
                            <td className="px-8 py-5 text-right whitespace-nowrap">
                              <button onClick={() => fetchHiveDetails(h.id)} className="inline-flex items-center text-[13px] font-semibold text-[#111111] hover:underline underline-offset-4 group-hover:text-black transition-all">
                                Inspect Sensors <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => { setActiveSection('iot'); setAiAnalysis(null); }} className="text-[13px] font-bold text-[#666666] hover:text-[#111111] flex items-center transition-colors">
                  ← Back to Network
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
                  <p className="text-[14px] text-[#555555] font-medium">Operator: {selectedHive.beekeeper} • Since {new Date(selectedHive.installationDate).toLocaleDateString()}</p>
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
                  <ActivitySquare className="w-12 h-12 text-[#E7E7E7] mb-5" strokeWidth={1.5} />
                  <h3 className="text-[18px] font-bold text-[#111111] mb-2">No Telemetry Data</h3>
                  <p className="text-[#666666] font-medium text-[14px]">Connect a physical ESP32 controller to receive environment data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <MetricCard label="Temp" value={selectedHive.current.temperature != null ? `${selectedHive.current.temperature}°` : 'N/A'} color={selectedHive.current.temperature == null ? "text-red-600" : ""} />
                  <MetricCard label="Humidity" value={selectedHive.current.humidity != null ? `${selectedHive.current.humidity}%` : 'N/A'} color={selectedHive.current.humidity == null ? "text-red-600" : ""} />
                  <MetricCard label="Pressure" value={selectedHive.current.pressure != null ? `${selectedHive.current.pressure}` : 'N/A'} color={selectedHive.current.pressure == null ? "text-red-600" : ""} />
                  <MetricCard label="Rain" value={selectedHive.current.rain != null ? (selectedHive.current.rain ? 'YES' : 'NO') : 'N/A'} />
                  <MetricCard label="UV Index" value={selectedHive.current.uv != null ? selectedHive.current.uv : 'N/A'} color={selectedHive.current.uv == null ? "text-red-600" : ""} />
                  <MetricCard label="Weight" value={selectedHive.current.weight != null ? `${selectedHive.current.weight}kg` : 'N/A'} color={selectedHive.current.weight == null ? "text-red-600" : ""} />
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

        </div>
      </main>
    </div>
  );
}
