"use client";

import React, { useState } from "react";
import { Monitor, Shield, Zap, Globe, Cpu, Settings, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ChildPanelPage() {
  const { formatAmount } = useCurrency();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [isDNSOpen, setIsDNSOpen] = useState(true);

  const [formData, setFormData] = useState({
    domain: "",
    adminName: "",
    adminPassword: "",
    confirmPassword: ""
  });

  const priceInNaira = 14287; // Equivalent of $10.99 at ₦1300/$

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.domain.includes(".")) {
      toast.error("Please enter a valid domain name");
      return;
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/child-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: formData.domain,
          adminName: formData.adminName,
          adminPassword: formData.adminPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error?.toLowerCase().includes("balance")) {
          setShowBalanceModal(true);
          return;
        }
        throw new Error(data.error || "Failed to purchase child panel");
      }

      toast.success("Child panel requested successfully!");
      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                      <Globe className="w-5 h-5" />
                      Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground">Fill in the details below to initialize your white-label panel.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Domain Field */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          Domain Name
                        </label>
                        <p className="text-[11px] font-normal text-muted-foreground">Enter your custom domain without HTTP:// or HTTPS://</p>
                      </div>
                      <input
                        type="text"
                        name="domain"
                        required
                        placeholder="e.g yourdomain.com"
                        value={formData.domain}
                        onChange={handleInputChange}
                        className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>


                    {/* Admin Credentials Fields */}
                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold">Admin Username</label>
                        <input
                          type="text"
                          name="adminName"
                          required
                          placeholder="Admin Username"
                          value={formData.adminName}
                          onChange={handleInputChange}
                          className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Admin Password</label>
                          <input
                            type="password"
                            name="adminPassword"
                            required
                            placeholder="••••••••"
                            value={formData.adminPassword}
                            onChange={handleInputChange}
                            className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Confirm Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>


                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-95 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 group"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Purchase & Launch Panel
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Successfully Requested!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your child panel request for <span className="text-primary font-semibold">{formData.domain}</span> has been received.
                    Our team will provision your panel within 24-48 hours.
                  </p>
                </div>
                <div className="p-4 bg-muted border border-border rounded-xl text-left max-w-sm mx-auto space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-yellow-500 uppercase tracking-wider text-xs">Pending Approval</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin User</span>
                    <span className="font-semibold">{formData.adminName}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-8 py-3 bg-muted hover:bg-muted/80 rounded-xl font-bold transition-all"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insufficient Balance Modal */}
          <AnimatePresence>
            {showBalanceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
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
                    <Link
                      href="/add-funds"
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 text-center"
                    >
                      Fund My Wallet
                    </Link>
                    <button
                      onClick={() => setShowBalanceModal(false)}
                      className="w-full py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setIsDNSOpen(!isDNSOpen)}
              className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider">DNS Configuration</h3>
              </div>
              <motion.div
                animate={{ rotate: isDNSOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isDNSOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-5 pt-0 space-y-4 border-t border-border/50">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Please point your domain name servers to the following record. This is required for your panel to function.
                    </p>
                    <div className="grid gap-2">
                      <div className="p-3 bg-muted/50 border border-border rounded-xl font-mono text-[11px] flex items-center justify-between group">
                        <span className="select-all">ns1.desocialplug.com</span>
                        <div className="text-[9px] uppercase font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Copy</div>
                      </div>
                      <div className="p-3 bg-muted/50 border border-border rounded-xl font-mono text-[11px] flex items-center justify-between group">
                        <span className="select-all">ns2.desocialplug.com</span>
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
