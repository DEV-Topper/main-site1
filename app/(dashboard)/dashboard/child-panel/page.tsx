"use client";

import React from "react";
import { Monitor, Shield, Zap, Globe, Cpu, Settings } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AuthGuard from "@/components/AuthGuard";

export default function ChildPanelPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8 min-h-screen bg-background text-foreground mt-4">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
          Child Panel
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Launch and manage your own white-label social media services panel.</p>
      </header>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Monitor className="w-24 h-24 md:w-32 md:h-32 text-blue-500" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium">
            <Zap className="w-3 h-3" />
            Coming Soon
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold">Your Own SMM Empire Starts Here</h2>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-base leading-relaxed">
            With our Child Panel partnership, you can start your own social media growth agency. 
            Connect your domain, set your own prices, and let our infrastructure handle the fulfillment. 
            All orders placed on your panel will be automatically routed through DeSocial Plug.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20">
              Join Waitlist
            </button>
            <button className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-all border border-border">
              View Documentation
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Globe,
            title: "Custom Domain",
            description: "Connect your own unique domain for a fully branded experience.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          },
          {
            icon: Shield,
            title: "White Label",
            description: "Your customers will never know DeSocial Plug is working behind the scenes.",
            color: "text-green-500",
            bg: "bg-green-500/10"
          },
          {
            icon: Cpu,
            title: "Auto-Synchronization",
            description: "Real-time service and balance syncing between our systems.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
          },
          {
            icon: Settings,
            title: "Profit Margin Control",
            description: "Set your own custom pricing and manage your profit margins easily.",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
          }
        ].map((feature, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors group">
            <div className={`p-3 rounded-xl ${feature.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
