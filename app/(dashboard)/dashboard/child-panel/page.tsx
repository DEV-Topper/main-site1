"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Shield, Zap, Globe, Cpu, Settings, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2, ChevronDown, Copy, Check, Clock } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ExistingPanel {
  exists: boolean;
  domain?: string;
  adminName?: string;
  status?: 'pending' | 'active' | 'rejected' | 'cancelled' | 'expired';
  panelId?: string;
  expires_at?: string;
  auto_renew?: boolean;
  subscription_price?: number;
  history?: any[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-200"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function ChildPanelPage() {
  const { formatAmount } = useCurrency();
  const router = useRouter();
  const [existingPanel, setExistingPanel] = useState<ExistingPanel | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [isDNSOpen, setIsDNSOpen] = useState(true);
  const [togglingRenew, setTogglingRenew] = useState(false);

  const [formData, setFormData] = useState({
    domain: "",
    adminName: "",
    adminPassword: "",
    confirmPassword: ""
  });

  const priceInNaira = 14287;

  // Load existing panel on mount
  const loadPanelData = () => {
    fetch("/api/user/child-panel")
      .then(r => r.json())
      .then(data => { setExistingPanel(data); setPageLoading(false); })
      .catch(() => setPageLoading(false));
  };

  useEffect(() => {
    loadPanelData();
  }, []);

  const handleToggleAutoRenew = async () => {
    if (!existingPanel?.panelId) return;
    setTogglingRenew(true);
    try {
      const resp = await fetch("/api/user/child-panel/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoRenew: !existingPanel.auto_renew })
      });
      if (resp.ok) {
        toast.success(`Auto-renew ${!existingPanel.auto_renew ? 'enabled' : 'disabled'}`);
        loadPanelData();
      }
    } catch (e) {
      toast.error("Failed to update auto-renew");
    } finally {
      setTogglingRenew(false);
    }
  };

  const handleManualRenew = async () => {
    if (!confirm("Proceed with manual renewal? The fee will be deducted from your balance.")) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/user/child-panel/subscription", {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Renewal failed");
      toast.success("Panel renewed successfully!");
      loadPanelData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domain.includes(".")) { toast.error("Please enter a valid domain name"); return; }
    if (formData.adminPassword !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const response = await fetch("/api/user/child-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: formData.domain,
          adminName: formData.adminName,
          adminPassword: formData.adminPassword,
          priceInNaira: 14287,
          priceInUsd: 10.99
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 && data.error?.toLowerCase().includes("balance")) { setShowBalanceModal(true); return; }
        throw new Error(data.error || "Failed to purchase child panel");
      }
      toast.success("Child panel purchased successfully!");
      loadPanelData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Rejected panels show the form again (with a notice at top)
  const showForm = !existingPanel?.exists || existingPanel?.status === 'rejected';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8 min-h-screen bg-background text-foreground mt-4">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
          Child Panel Partnership
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Launch your own white-label social media marketplace panel in minutes.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">

            {/* ─── ACTIVE/PENDING: Show status + DNS guide ─── */}
            {existingPanel?.exists && existingPanel.status !== 'rejected' ? (
              <motion.div key="existing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* Subscription Status Card */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 md:p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu className="w-24 h-24" /></div>
                    <div className="flex items-start justify-between relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${existingPanel.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            {existingPanel.status}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan: Pro Monthly</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">{existingPanel.domain}</h2>
                        <p className="text-blue-200/60 text-xs font-medium">Managed White-Label Infrastructure</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60 mb-1">Monthly Billing</p>
                        <p className="text-2xl font-black">{formatAmount(existingPanel.subscription_price || 14287)}</p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Renewal Date</p>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          {existingPanel.expires_at ? new Date(existingPanel.expires_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto-Renewal</p>
                        <button
                          onClick={handleToggleAutoRenew}
                          disabled={togglingRenew}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${existingPanel.auto_renew
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                            }`}
                        >
                          {togglingRenew ? '...' : existingPanel.auto_renew ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Access</p>
                        <p className="text-sm font-bold">{existingPanel.adminName || 'Admin'}</p>
                      </div>
                    </div>
                    {existingPanel.status === 'expired' && !existingPanel.auto_renew && (
                      <button
                        onClick={handleManualRenew}
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                      >
                        {loading ? 'Processing...' : 'Renew Now'}
                      </button>
                    )}
                  </div>
                </div>

                {/* DNS Instructions */}
                <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-5 md:p-6 border-b border-white/10 flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold">DNS Configuration Guide</h3>
                  </div>
                  <div className="p-5 md:p-6 space-y-5">
                    <p className="text-sm text-slate-300">
                      Go to the place where you bought your domain (Namecheap, GoDaddy, Cloudflare, etc.) and add this record:
                    </p>
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Name / Host</th>
                            <th className="px-4 py-3">Value / Points To</th>
                            <th className="px-4 py-3">TTL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-white/10">
                            <td className="px-4 py-3 font-mono text-blue-300 font-bold text-xs">CNAME</td>
                            <td className="px-4 py-3 font-mono text-[10px]"><span className="text-yellow-300">@</span> <span className="text-slate-500 text-[10px]">(or www)</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <code className="text-[10px] text-green-300 bg-white/5 px-2 py-0.5 rounded">cname.vercel-dns.com</code>
                                <CopyButton text="cname.vercel-dns.com" />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[10px]">Auto</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Log into your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)",
                        `Find the DNS settings for ${existingPanel.domain}`,
                        "Add a new CNAME record: name = @ (or www), value = cname.vercel-dns.com",
                        "Save the changes and wait up to 24 hours for DNS to propagate globally",
                        "Once DNS is set and your panel is approved, customers can visit your domain!",
                      ].map((text, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-sm text-slate-300">{text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                      ⚠️ DNS changes can take 24-48 hours to propagate globally.
                    </div>
                  </div>
                </div>

                {/* Subscription History Table */}
                {/* <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-border/50 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-black text-sm uppercase tracking-widest">Billing History</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            <tr>
                               <th className="px-6 py-4">Transaction ID</th>
                               <th className="px-6 py-4">Date</th>
                               <th className="px-6 py-4">Amount</th>
                               <th className="px-6 py-4">Period</th>
                               <th className="px-6 py-4">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/50">
                            {existingPanel.history?.length ? existingPanel.history.map((h, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                 <td className="px-6 py-4 font-mono text-[10px] font-bold text-muted-foreground uppercase">{h.id.slice(0, 8)}</td>
                                 <td className="px-6 py-4 text-[11px] font-bold">{new Date(h.created_at).toLocaleDateString()}</td>
                                 <td className="px-6 py-4 text-[11px] font-black text-foreground">{formatAmount(h.amount)}</td>
                                 <td className="px-6 py-4 text-[10px] font-medium text-muted-foreground">
                                    {new Date(h.period_start).toLocaleDateString()} - {new Date(h.period_end).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20">
                                       {h.status}
                                    </span>
                                 </td>
                              </tr>
                            )) : (
                              <tr>
                                 <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs italic font-medium">
                                    No billing records found.
                                 </td>
                              </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div> */}
              </motion.div>

            ) : (

              /* ─── NEW / REJECTED: Show form ─── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8"
              >
                {/* Rejection notice */}
                {existingPanel?.status === 'rejected' && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-red-500">Previous panel was rejected</p>
                      <p className="text-xs text-muted-foreground mt-1">Your previous subscription has been refunded to your wallet. You can submit a new request below.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                      <Globe className="w-5 h-5" />
                      Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground">Fill in the details below to initialize your white-label panel.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold flex items-center gap-2">Domain Name</label>
                        <p className="text-[11px] font-normal text-muted-foreground">Enter your custom domain without HTTP:// or HTTPS://</p>
                      </div>
                      <input
                        type="text" name="domain" required placeholder="e.g yourdomain.com"
                        value={formData.domain} onChange={handleInputChange}
                        className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>

                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold">Admin Username</label>
                        <input
                          type="text" name="adminName" required placeholder="Admin Username"
                          value={formData.adminName} onChange={handleInputChange}
                          className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Admin Password</label>
                          <input
                            type="password" name="adminPassword" required placeholder="••••••••"
                            value={formData.adminPassword} onChange={handleInputChange}
                            className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Confirm Password</label>
                          <input
                            type="password" name="confirmPassword" required placeholder="••••••••"
                            value={formData.confirmPassword} onChange={handleInputChange}
                            className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-95 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 group"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>Purchase & Launch Panel <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insufficient Balance Modal */}
          <AnimatePresence>
            {showBalanceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Insufficient Balance</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Your balance is not up to the amount. Please fund your wallet to continue with your child panel request.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Link href="/add-funds" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 text-center">
                      Fund My Wallet
                    </Link>
                    <button onClick={() => setShowBalanceModal(false)} className="w-full py-3 text-muted-foreground hover:text-foreground font-medium transition-colors">Close</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="space-y-6">
          {/* DNS card — only show on the form view */}
          {showForm && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setIsDNSOpen(!isDNSOpen)}
                className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Monitor className="w-5 h-5 text-blue-500" /></div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">DNS Configuration</h3>
                </div>
                <motion.div animate={{ rotate: isDNSOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isDNSOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <div className="p-5 pt-0 space-y-4 border-t border-border/50">
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Please point your domain name servers to the following record. This is required for your panel to function.
                      </p>
                      <div className="grid gap-2">
                        <div className="p-3 bg-muted/50 border border-border rounded-xl font-mono text-[11px] flex items-center justify-between group">
                          <span className="select-all">cname.vercel-dns.com</span>
                          <div className="text-[9px] uppercase font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Copy</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 italic bg-muted/30 p-3 rounded-lg border border-border/30">
                        Note: DNS propagation can take up to 24-48 hours depending on your registrar.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Package Summary */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Package Summary
            </h3>
            <div className="space-y-3 pb-4 border-b border-white/10">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Child Panel Subscription</span>
                <span className="font-medium">Monthly Plan</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">White-Label Status</span>
                <span className="font-medium text-green-400">Yes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">API Integration</span>
                <span className="font-medium text-blue-300 italic">Full Access</span>
              </div>
            </div>
            <div className="pt-4 space-y-1">
              <div className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Monthly Price</div>
              <div className="text-4xl font-bold tabular-nums tracking-tight">{formatAmount(priceInNaira)}</div>
              <div className="text-[10px] opacity-60">* Renewal managed via wallet balance</div>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
              Premium Benefits
            </h3>
            <ul className="space-y-3">
              {[
                "Fully Branded SMM Panel",
                "Full API Order Sync",
                "Profit Margin Management",
                "Unlimited Service Import",
                "Free Technical Support",
                "Daily Database Backups"
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-foreground/80 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
