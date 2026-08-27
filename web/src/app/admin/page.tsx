"use client";

import { useEffect, useState } from 'react';
import { ShieldAlert, Users, Hexagon, BarChart3, Search, Activity, PackageCheck, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/admin/dashboard`);
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      }
    }
    fetchStats();
    
    // Poll every 10 seconds for real-time feel
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white min-h-screen flex flex-col border-r border-gray-300 shadow-sm z-20 relative">
        <div className="p-8 border-b border-gray-200 text-center">
          <img 
            src="https://sih.gov.in/img1/SIH2026-logo.png" 
            alt="SIH 2026 Logo" 
            className="h-12 mx-auto mb-6 object-contain"
          />
          <h1 className="text-xl font-black tracking-widest uppercase text-gray-900">HoneyChain</h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold bg-gray-100 py-1 rounded-md border border-gray-200">KVIC Admin Center</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <a href="#" className="flex items-center px-4 py-3 bg-black text-white rounded-md font-bold shadow-sm">
            <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md font-semibold transition-colors">
            <Hexagon className="w-5 h-5 mr-3" /> Supply Chain
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md font-semibold transition-colors">
            <Users className="w-5 h-5 mr-3" /> Beekeepers
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md font-semibold transition-colors">
            <PackageCheck className="w-5 h-5 mr-3" /> QA & Labs
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md font-semibold transition-colors mt-8 border border-transparent hover:border-red-100">
            <ShieldAlert className="w-5 h-5 mr-3" /> Security Alerts
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-gray-300">
          <div>
            <h2 className="text-2xl font-black tracking-widest uppercase text-gray-900">System Overview</h2>
            <p className="text-gray-500 text-sm font-semibold mt-1 uppercase tracking-widest">Real-time trace and security analytics.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search batches, QRs..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm font-medium w-64"
            />
          </div>
        </header>

        {/* Top Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-7 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Total Honey</p>
            <p className="text-4xl font-black text-gray-900">{stats?.totalHoneyKg ?? 0}<span className="text-xl text-gray-400 ml-1 font-bold">kg</span></p>
          </div>
          <div className="bg-white p-7 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Active Batches</p>
            <p className="text-4xl font-black text-gray-900">{stats?.activeBatches ?? 0}</p>
          </div>
          <div className="bg-white p-7 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Verified Scans</p>
            <p className="text-4xl font-black text-green-700">{stats?.verifiedScans ?? 0}</p>
          </div>
          <div className="bg-white p-7 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
            <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
               <AlertTriangle className="w-4 h-4 mr-1.5" /> Suspicious QR
            </p>
            <p className="text-4xl font-black text-red-700">{stats?.suspiciousQrs ?? 0}</p>
          </div>
        </div>

        {/* Security & Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-black uppercase tracking-wider text-sm">Security Alerts</h3>
            <button className="text-xs font-bold text-black hover:underline uppercase tracking-wider">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats?.recentAlerts?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-bold">No suspicious activity detected.</div>
            ) : (
              stats?.recentAlerts?.map((alert: any) => (
                <div key={alert.id} className="p-6 flex items-start">
                  <div className="bg-gray-100 p-2.5 rounded-md mr-5 border border-gray-200">
                    <Activity className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-black text-lg">{alert.title}</h4>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">{alert.message}</p>
                    <div className="mt-4 flex gap-3">
                      <button className="text-xs font-bold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded">INVESTIGATE</button>
                      <button className="text-xs font-bold text-black bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded">DISMISS</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
