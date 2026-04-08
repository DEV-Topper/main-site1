"use client";

import React, { useState, useEffect } from "react";
import { 
  Monitor, 
  Shield, 
  Zap, 
  Globe, 
  Cpu, 
  Settings, 
  Server, 
  Key, 
  User as UserIcon, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";

const PRICE = 20000;

export default function ChildPanelPage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [domain, setDomain] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setBalance(data.user.walletBalance || 0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (balance !== null && balance < PRICE) {
      return toast.error("Insufficient balance. Please fund your wallet.");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/child-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          adminUsername,
          adminPassword,
          confirmPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Child panel setup initiated!");
        setSuccess(true);
      } else {
        toast.error(data.error || "Failed to process order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Order Successful!</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Your child panel setup has been recorded. Our team will begin the provisioning process shortly. 
          Please ensure your DNS settings are updated.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-all"
          >
            Order Another
          </button>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 min-h-screen bg-background text-foreground mt-4 pb-20">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
          Child Panel Setup
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Launch your own white-label social media services panel in minutes.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Panel Configuration
              </h2>
            </div>
            <form onSubmit={handlePurchase} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Domain Name
                </label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. smmpanel.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <p className="text-[10px] text-muted-foreground">Enter your custom domain without http:// or https://</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserIcon className="w-4 h-4" /> Admin Username
                  </label>
                  <input 
                    required
                    type="text"
                    placeholder="admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Admin Password
                  </label>
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Key className="w-4 h-4" /> Confirm Password
                </label>
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="pt-4">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By proceeding, you agree to pay the setup fee. The panel will be provisioned once DNS settings are verified. 
                    Monthly renewals are automatic if balance is available.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Setup Cost</p>
                  <p className="text-3xl font-bold text-foreground">{formatAmount(PRICE)}</p>
                </div>

                <div className="w-full sm:w-auto">
                  {balance !== null && balance < PRICE ? (
                    <Link 
                      href="/add-funds"
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-yellow-500 text-white hover:bg-yellow-600 rounded-xl font-bold transition-all shadow-lg w-full"
                    >
                      <Wallet className="w-5 h-5" />
                      Fund Wallet to Order
                    </Link>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || loading}
                      className="flex items-center justify-center gap-2 px-10 py-4 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 w-full"
                    >
                      {submitting ? "Processing..." : "Pay & Setup Panel"}
                      {!submitting && <ArrowRight className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
              <Server className="w-5 h-5 text-green-500" />
              DNS Configuration
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please point your domain nameservers to the following records. This is required for your panel to function.
            </p>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nameserver 1</p>
                <code className="text-sm font-mono text-primary font-semibold">ns1.desocialplug.com</code>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nameserver 2</p>
                <code className="text-sm font-mono text-primary font-semibold">ns2.desocialplug.com</code>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-yellow-600 dark:text-yellow-400">Note:</span> DNS propagation can take up to 24-48 hours depending on your registrar.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white space-y-4 shadow-lg">
            <div className="p-3 bg-white/20 rounded-xl w-fit">
              <Zap className="w-6 h-6 fill-yellow-300 text-yellow-300" />
            </div>
            <h3 className="text-xl font-bold">Need Help?</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Our support team can help you with domain connection or panel configuration at no extra cost.
            </p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
