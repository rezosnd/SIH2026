"use client";
import { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Users, Hexagon, BarChart3, Activity, PackageCheck, AlertTriangle, Bell, ChevronRight, CheckCircle, XCircle, Eye } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://sih-2026-kiit-1c9fdv5nf-rehan-sumans-projects.vercel.app';

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
          <div className="flex justify-center mb-4"><ShieldAlert className="w-12 h-12 text-gray-900" /></div>
          <h1 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-2">HoneyChain Admin</h1>
          <p className="text-xs text-gray-500 mb-6 font-semibold">Enter your secure password to continue</p>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4 text-center font-mono"
            onKeyDown={e => e.key === 'Enter' && password === 'password123' && setIsAuthenticated(true)}
          />
          <button 
            onClick={() => password === 'password123' && setIsAuthenticated(true)}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
          >
            LOGIN
          </button>
        </div>
      </div>
    );
  }

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
          <NavItem id="notifications" icon={Bell} label="Notifications" />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <a href="/kvic/dashboard" className="flex items-center px-4 py-2 text-gray-500 hover:text-black text-sm font-semibold">
            <Users className="w-4 h-4 mr-2" /> KVIC View
          </a>
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
                <MetricCard label="Open Alerts" value={secMetrics?.open} color="text-red-700" accent="bg-red-500" />
                <MetricCard label="Resolved Alerts" value={secMetrics?.resolved} color="text-green-700" />
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
        </div>
      </main>
    </div>
  );
}
