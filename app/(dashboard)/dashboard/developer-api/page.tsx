"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Key, Copy, RefreshCw, Check, Code2, Layers } from "lucide-react";

export default function DeveloperApiPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/keys")
      .then(res => res.json())
      .then(data => {
        setApiKey(data.apiKey);
        setLoading(false);
      });
  }, []);

  const generateKey = async () => {
    setGenerating(true);
    const res = await fetch("/api/user/keys", { method: "POST" });
    const data = await res.json();
    setApiKey(data.apiKey);
    setGenerating(false);
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 min-h-screen bg-[#0a0a0b] text-white rounded-xl mt-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Developer API
        </h1>
        <p className="text-gray-400">Manage your authentication keys and connect your application programmatically.</p>
      </header>

      <div className="bg-[#161618] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Public API Key</h2>
          </div>
          <button 
            onClick={generateKey}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm text-white"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            {apiKey ? "Regenerate Key" : "Generate Key"}
          </button>
        </div>

        <div className="flex items-center gap-4 bg-[#0a0a0b] border border-gray-800 rounded-xl p-4">
          <code className="flex-1 text-gray-300 font-mono overflow-x-auto whitespace-nowrap">
            {loading ? "Fetching..." : apiKey || "No API key generated yet."}
          </code>
          {apiKey && (
            <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded flex items-center justify-center">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-4">Do not share this key with anyone. It provides full read access to public logs.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#161618] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">API Endpoint Reference</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Fetch available logs using a standard HTTP GET request with your API key.</p>
          <pre className="bg-[#0a0a0b] p-4 rounded-xl text-xs text-gray-400 overflow-x-auto font-mono">
{`curl -X GET "https://desocialplug.com/api/public/logs" \\
  -H "x-api-key: YOUR_API_KEY"`}
          </pre>
        </div>

        <div className="bg-[#161618] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Advanced Filtering</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">You can target specific platforms or categories using query parameters.</p>
           <pre className="bg-[#0a0a0b] p-4 rounded-xl text-xs text-gray-400 overflow-x-auto font-mono">
{`// 1. Fetch only Instagram logs
GET /api/public/logs?platform=Instagram

// 2. Fetch Facebook Random logs
GET /api/public/logs?platform=Facebook&subcategory=Random`}
          </pre>
        </div>
      </div>
    </div>
  );
}
