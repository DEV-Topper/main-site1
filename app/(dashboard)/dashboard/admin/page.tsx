"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Globe, DollarSign, Search, CheckCircle, XCircle, 
  Clock, ArrowRight, ExternalLink, RefreshCw, Filter, 
  ChevronDown, ShieldCheck, Zap, Activity, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PanelStats {
  totalUsers: number;
  totalDeposits: number;
  totalRevenue: number;
}

interface ChildPanel {
  id: string;
  domain: string;
  adminName: string;
  status: 'pending' | 'active' | 'rejected' | 'cancelled';
  createdAt: string;
  priceInNaira: number;
  stats: PanelStats;
}

export default function SuperAdminPage() {
  const [panels, setPanels] = useState<ChildPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [search, setSearch] = useState("");
  
  // Secondary Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    
    // Hardcoded credentials as requested
    if (adminEmail === "superadmin@gmail.com" && adminPassword === "superadmin123!") {
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoginLoading(false);
        toast.success("Security Clearance Granted. Welcome, Boss.");
      }, 1000);
    } else {
      setTimeout(() => {
        toast.error("Invalid Admin Credentials. Access Denied.");
        setIsLoginLoading(false);
      }, 800);
    }
  };

  const fetchPanels = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const secretKey = "dsp_master_secret_2025_security_bypass"; 
      
      const res = await fetch(`/api/admin/child-panels${filter !== 'all' ? `?status=${filter}` : ''}`, {
        headers: { 'x-super-admin-key': secretKey }
      });
      const data = await res.json();
      
      if (data.success) {
        setPanels(data.panels);
      } else {
        toast.error(data.error || "Failed to fetch panels");
      }
    } catch (error) {
      toast.error("An error occurred while fetching panels");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPanels();
    }
  }, [filter, isAuthenticated]);

  const handleStatusChange = async (panelId: string, newStatus: string) => {
    const secretKey = "dsp_superadmin_2025_secret_key_change_this";
    try {
      const res = await fetch('/api/admin/child-panels', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-super-admin-key': secretKey
        },
        body: JSON.stringify({ panelId, status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Panel ${newStatus} successfully`);
        fetchPanels(true);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredPanels = panels.filter(p => 
    p.domain.toLowerCase().includes(search.toLowerCase()) || 
    p.adminName.toLowerCase().includes(search.toLowerCase())
  );

  const totalGlobalRevenue = panels.reduce((sum, p) => sum + (p.stats?.totalRevenue || 0), 0);
  const totalGlobalUsers = panels.reduce((sum, p) => sum + (p.stats?.totalUsers || 0), 0);
  const activePanelsCount = panels.filter(p => p.status === 'active').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden"
        >
          <div className="bg-blue-600 p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Super Admin Portal</h2>
            <p className="text-blue-100 text-sm font-medium">Restricted Access. Level 5 Clearance Required.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Email</label>
                <input 
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-5 py-3 bg-muted/50 border-none rounded-2xl focus:ring-2 ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Access Password</label>
                <input 
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-3 bg-muted/50 border-none rounded-2xl focus:ring-2 ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoginLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:scale-100"
            >
              {isLoginLoading ? "Verifying Credentials..." : "Unlock Platform Controls"}
            </button>

            <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
              Session monitored and logged • DeSocialPlug LTD
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Super Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-sm uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Super Admin Control
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Platform Management
          </h1>
          <p className="text-muted-foreground font-medium">Oversee every child panel across the entire network.</p>
        </div>
        
        <button 
          onClick={() => fetchPanels(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-card border border-border hover:bg-muted rounded-2xl font-bold transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          {refreshing ? 'Refreshing Live Data...' : 'Refresh All Stats'}
        </button>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Global Network Revenue", value: formatAmount(totalGlobalRevenue), icon: DollarSign, color: "bg-green-500", shadow: "shadow-green-500/20" },
          { label: "Total Managed Users", value: totalGlobalUsers.toLocaleString(), icon: Users, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
          { label: "Active Child Panels", value: activePanelsCount, icon: Globe, color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-card border border-border p-6 rounded-3xl shadow-xl ${stat.shadow} relative overflow-hidden group`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.color} rounded-2xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-3xl shadow-sm">
        <div className="flex p-1 bg-muted/50 rounded-2xl w-full md:w-auto">
          {['all', 'pending', 'active', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === s ? 'bg-background shadow-sm text-blue-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search domain or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-muted/50 border-none rounded-2xl focus:ring-2 ring-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Panel List */}
      <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Child Panel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Live Stats</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {filteredPanels.map((panel) => (
                  <motion.tr 
                    layout
                    key={panel.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">
                          {panel.domain[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-lg flex items-center gap-2">
                            {panel.domain}
                            {panel.status === 'active' && (
                              <a href={`https://${panel.domain}`} target="_blank" className="text-muted-foreground hover:text-blue-500">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Owner: <span className="text-foreground">{panel.adminName}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6">
                      {panel.status === 'active' ? (
                        <div className="flex flex-col items-center gap-2">
                          {(panel.stats as any)?.error ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Connection Error
                              </span>
                              <p className="text-[10px] text-red-500/70 font-medium italic">{(panel.stats as any).error}</p>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Revenue</p>
                                <p className="font-bold text-green-500">{formatAmount(panel.stats?.totalRevenue || 0)}</p>
                              </div>
                              <div className="text-center border-x border-border px-4">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Users</p>
                                <p className="font-bold">{(panel.stats?.totalUsers || 0).toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Deposits</p>
                                <p className="font-bold text-blue-500">{formatAmount(panel.stats?.totalDeposits || 0)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground italic">
                          Wait for activation...
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-6">
                      <p className="text-sm font-bold">{new Date(panel.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(panel.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>

                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        panel.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        panel.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          panel.status === 'active' ? 'bg-green-500' :
                          panel.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        {panel.status}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {panel.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(panel.id, 'active')}
                              className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(panel.id, 'rejected')}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {panel.status === 'active' && (
                          <button 
                            onClick={() => handleStatusChange(panel.id, 'rejected')}
                            className="px-4 py-2 bg-muted text-foreground border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredPanels.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-xl">No panels found</p>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Hint */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl z-50">
        <Activity className="w-4 h-4 text-green-400 animate-pulse" />
        <span className="text-sm font-bold tracking-tight">Super Admin: Platform Status Healthy</span>
        <div className="w-px h-4 bg-white/20 mx-2" />
        <span className="text-[10px] font-black uppercase opacity-60">v2.0 LIVE</span>
      </div>
    </div>
  );
}
