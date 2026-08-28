"use client";
import { useEffect, useState } from 'react';
import { BarChart3, Users, Hexagon, Package, ShieldAlert, Activity, AlertTriangle, ChevronRight, TrendingUp, XCircle, Plus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-eight-jade-26.vercel.app';

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
                    {['Location', 'Status', 'IoT Connection', 'Temp / Hum', 'Beekeeper', 'Total Batches'].map(h => (
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
                    </tr>
                    );
                  })}
                </tbody>
              </table>
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
