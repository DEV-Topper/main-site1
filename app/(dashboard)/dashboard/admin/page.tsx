"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, DollarSign, Server, Activity, Globe, 
  Search, Filter, ArrowUpRight, ArrowDownRight,
  Shield, Layout, CreditCard, TrendingUp, Settings, ChevronRight, CheckCircle2, XCircle, ExternalLink,
  Menu, X, Clock, Check, Eye
} from "lucide-react";

// In Next.js we use process.env instead of import.meta.env
const ADMIN_KEY = "DSP_ADMIN_MASTER_2024"; // Fallback for local, should be in env

interface PendingPanel {
  id: string;
  domain: string;
  adminName: string;
  status: string;
  createdAt: string;
}

interface ChildPanel {
  id: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  panelUrl: string;
  ownerBalance: number;
  userCount: number;
  totalUserBalance: number;
  totalUserSpending: number;
  totalRevenue: number;
  grossProfit: number;
  status: 'active' | 'suspended' | 'pending' | 'rejected';
  uptime: string;
  topUsers: any[];
  expiryDate: string;
  discountPercent: number;
  totalApiLogs: number;
  recentApiActivity: any[];
}

export default function SuperAdminDashboard() {
  const [selectedPanel, setSelectedPanel] = useState<ChildPanel | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [panels, setPanels] = useState<ChildPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/child-panels`, {
        headers: { 'x-super-admin-key': ADMIN_KEY },
      });
      const data = await res.json();
      if (data.success) {
        const basePanels = data.panels;
        setPanels(basePanels.map((p: any) => ({
          ...p,
          ownerName: p.adminName || 'Admin',
          ownerEmail: 'secure@admin.com',
          panelUrl: p.domain,
          ownerBalance: p.priceInNaira || 0,
          userCount: 0,
          totalUserBalance: 0,
          totalUserSpending: 0,
          totalRevenue: 0,
          grossProfit: 0,
          uptime: "100%",
          topUsers: [],
          expiryDate: new Date(new Date(p.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          discountPercent: 0,
          totalApiLogs: 0,
          recentApiActivity: []
        })));

        // Now, fetch real-time stats from each ACTIVE panel's bridge
        const activePanels = basePanels.filter((p: any) => p.status === 'active');
        
        for (const p of activePanels) {
          try {
            const statsRes = await fetch(`https://${p.domain}/api/dsp?action=admin-data`, {
              headers: { 'x-super-admin-key': ADMIN_KEY }
            });
            const statsData = await statsRes.json();
            
            if (statsData.success && statsData.data) {
              const { stats, users, transactions } = statsData.data;
              
              setPanels(prev => prev.map(panel => {
                if (panel.id === p.id) {
                  return {
                    ...panel,
                    userCount: stats.total_users || 0,
                    totalRevenue: stats.total_revenue || 0,
                    ownerBalance: stats.total_deposits || 0, // In this view, balance is total site deposits
                    topUsers: users || [],
                    recentApiActivity: transactions || []
                  };
                }
                return panel;
              }));
            }
          } catch (err) {
            console.error(`Failed to fetch stats for ${p.domain}:`, err);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch panels', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (panelId: string, status: 'active' | 'rejected') => {
    setApprovingId(panelId);
    try {
      const res = await fetch(`/api/admin/child-panels`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-super-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify({ panelId, status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPanels();
        if (selectedPanel?.id === panelId) setSelectedPanel(null);
      }
    } catch (e) {
      console.error('Approval failed', e);
    } finally {
      setApprovingId(null);
    }
  };

  const totalUsers = panels.reduce((sum, p) => sum + (p.userCount || 0), 0);
  const aggregateRevenue = panels.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const globalSpending = panels.reduce((sum, p) => sum + (p.ownerBalance || 0), 0);

  const stats = [
    { label: "Total Child Panels", value: panels.length.toString(), icon: <Layout className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total User Base", value: totalUsers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Aggregate Revenue", value: `₦${aggregateRevenue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Global Deposits", value: `₦${globalSpending.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const filteredPanels = panels.filter(p => {
    if (activeTab === 'all') return p.status !== 'rejected';
    return p.status === activeTab;
  });

  const pendingPanels = panels.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tighter">SUPER<span className="text-blue-600">ADMIN</span></h1>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Network Command</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem icon={<Activity className="w-4 h-4" />} label="Network Pulse" active />
            <SidebarItem icon={<Layout className="w-4 h-4" />} label="Child Panels" />
            <SidebarItem icon={<Globe className="w-4 h-4" />} label="Public Market" />
            <SidebarItem icon={<CreditCard className="w-4 h-4" />} label="Financials" />
            <SidebarItem icon={<Users className="w-4 h-4" />} label="Master Users" />
            <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 lg:p-12 max-w-[1600px] mx-auto w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Network Inventory</h2>
              <p className="text-sm font-medium text-slate-500">Global oversight of all white-label partner panels.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="h-12 px-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 w-64">
                 <Search className="text-slate-400 w-4 h-4" />
                 <input type="text" placeholder="Search domains..." className="bg-transparent border-none outline-none text-xs font-bold w-full" />
               </div>
               <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition text-slate-600">
                 <Filter className="w-4 h-4" />
               </button>
            </div>
          </header>

          {/* PENDING APPROVALS ALERT */}
          {pendingPanels.length > 0 && (
            <div className="mb-12 p-1 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
              <div className="bg-white rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-900">Pending Approvals</h3>
                    <p className="text-xs font-bold text-slate-400">{pendingPanels.length} panels are waiting for infrastructure activation.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pendingPanels.slice(0, 3).map((p, i) => (
                    <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black">
                      {p.domain}
                    </div>
                  ))}
                  {pendingPanels.length > 3 && <span className="text-[10px] font-black text-slate-400">+{pendingPanels.length - 3} more</span>}
                </div>
              </div>
            </div>
          )}

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                  <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All Panels" />
                  <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="Pending" />
                  <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} label="Active" />
                  <TabButton active={activeTab === 'suspended'} onClick={() => setActiveTab('suspended')} label="Suspended" />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5">Partner / Domain</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-center">Expiry</th>
                    <th className="px-8 py-5 text-right">Balance</th>
                    <th className="px-8 py-5 text-center">Users</th>
                    <th className="px-8 py-5 text-right">Revenue</th>
                    <th className="px-8 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-12 text-center text-slate-400 font-bold italic">
                        Loading network inventory...
                      </td>
                    </tr>
                  ) : filteredPanels.map((panel) => (
                    <tr key={panel.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs">
                            {panel.ownerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm group-hover:text-blue-600 transition-colors">{panel.panelUrl}</p>
                            <p className="text-[10px] font-bold text-slate-400">{panel.ownerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          panel.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          panel.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {panel.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {panel.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="font-black text-xs">{panel.expiryDate}</span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-sm">
                        ₦{panel.ownerBalance.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center font-black text-sm">
                        {panel.userCount}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-sm text-emerald-600">
                        ₦{panel.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => setSelectedPanel(panel)}
                          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-90"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL DRAWER */}
      <AnimatePresence>
        {selectedPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPanel(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 w-full max-w-xl h-screen bg-white shadow-3xl z-[101] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <button onClick={() => setSelectedPanel(null)} className="h-10 px-4 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-500">
                  <X className="w-4 h-4" /> Close
                </button>
                <div className="flex items-center gap-2">
                   <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedPanel.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {selectedPanel.status}
                   </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-600/20">
                    {selectedPanel.ownerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{selectedPanel.ownerName}</h3>
                    <p className="text-slate-400 font-bold flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-blue-500" /> {selectedPanel.panelUrl}
                    </p>
                  </div>
                </div>

                {/* MODERATION ACTIONS */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedPanel.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleApproval(selectedPanel.id, 'active')}
                        disabled={approvingId === selectedPanel.id}
                        className="p-6 rounded-3xl bg-emerald-500 text-white flex flex-col items-center justify-center gap-2 hover:brightness-110 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Approve Panel</span>
                      </button>
                      <button 
                        onClick={() => handleApproval(selectedPanel.id, 'rejected')}
                        disabled={approvingId === selectedPanel.id}
                        className="p-6 rounded-3xl bg-slate-50 text-slate-900 border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition disabled:opacity-50"
                      >
                        <XCircle className="w-6 h-6" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Reject Request</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center gap-2 hover:brightness-110 transition">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <span className="font-black text-[10px] uppercase tracking-widest">View Analytics</span>
                      </button>
                      <button className="p-6 rounded-3xl bg-slate-50 text-slate-900 border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition">
                        <XCircle className="w-6 h-6" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Suspend Site</span>
                      </button>
                    </>
                  )}
                </div>

                {/* INFO BLOCKS */}
                <div className="space-y-4">
                   <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Subscription Details</p>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-xl font-black">₦{selectedPanel.ownerBalance.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-400">Monthly Billing</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black">{selectedPanel.expiryDate}</p>
                            <p className="text-[10px] font-bold text-slate-400">Next Renewal</p>
                         </div>
                      </div>
                   </div>
                </div>

              </div>
              
              <div className="p-10 border-t border-slate-100">
                 <button 
                  onClick={() => window.open(`https://${selectedPanel.panelUrl}/admin`, '_blank')}
                  className="w-full h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    <ExternalLink className="w-5 h-5" /> Open Panel Admin
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );
}
