"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Monitor, Globe, Shield, AlertCircle, 
  CheckCircle2, Clock, ArrowRight, Search, 
  Filter, MoreVertical, ExternalLink, Zap,
  TrendingUp, DollarSign, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminPanels() {
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadPanels = async () => {
    try {
      const res = await fetch("/api/admin/child-panels");
      const data = await res.json();
      if (data.success) {
        setPanels(data.panels);
      }
    } catch (error) {
      toast.error("Failed to load panels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanels();
  }, []);

  const handleUpdateStatus = async (panelId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/child-panels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelId, status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Panel ${status} successfully`);
        loadPanels();
      }
    } catch (error) {
      toast.error("Failed to update panel");
    }
  };

  const filteredPanels = panels.filter(p => {
    const matchesSearch = p.domain.toLowerCase().includes(search.toLowerCase()) || 
                         p.userId?.username?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: panels.length,
    active: panels.filter(p => p.status === 'active').length,
    pending: panels.filter(p => p.status === 'pending').length,
    revenue: panels.reduce((sum, p) => sum + (p.subscriptionPrice || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading Panel Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-background">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Global Panel Control
          </h1>
          <p className="text-muted-foreground font-medium">Overseeing {stats.total} child panels across the ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">Super Admin Root</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Panels", value: stats.total, icon: Monitor, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Sites", value: stats.active, icon: Globe, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pending Setup", value: stats.pending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Total MRR", value: `₦${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-indigo-500", bg: "bg-indigo-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-black mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search domains or owners..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-xl">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-sm font-bold focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b border-border">
                <th className="px-6 py-4">Panel Details</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPanels.map((panel) => (
                <tr key={panel._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                        {panel.domain[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none">{panel.domain}</p>
                        <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 inline-block ${
                          panel.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {panel.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">@{panel.userId?.username || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground">{panel.userId?.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-green-600">₦{(panel.subscriptionPrice || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                        {panel.autoRenew ? 'Auto-Renew ON' : 'Auto-Renew OFF'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">{new Date(panel.expiresAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(panel.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(panel._id, panel.status === 'active' ? 'suspended' : 'active')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          panel.status === 'active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        {panel.status === 'active' ? 'Suspend' : 'Approve'}
                      </button>
                      <a 
                        href={`https://${panel.domain}/admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-muted rounded-lg transition-colors group-hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPanels.length === 0 && (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="font-bold text-muted-foreground">No panels found matching your criteria.</p>
              <button onClick={() => {setSearch(""); setFilter("all")}} className="text-primary text-sm font-bold hover:underline">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
