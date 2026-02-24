"use client";

import { useState } from "react";
import WalletAnalyzer from "@/components/WalletAnalyzer";
import ProtocolExplorer from "@/components/ProtocolExplorer";

const TABS = [
  { id: "wallet", label: "Wallet Risk Analyzer", icon: "🔍" },
  { id: "protocols", label: "Protocol Explorer", icon: "📊" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("wallet");

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Header */}
      <header className="border-b border-[#1e1e3f] bg-[#0d0d1a]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                ERC-8004 Risk Underwriter
              </h1>
              <p className="text-gray-500 text-xs">On-Chain AI Risk Analysis · DeFi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
              ✦ AI Powered
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
              ERC-8004
            </span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="border-b border-[#1e1e3f] bg-[#0d0d1a]">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-[#1e1e3f]"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "wallet" && <WalletAnalyzer />}
        {activeTab === "protocols" && <ProtocolExplorer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e3f] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="text-gray-600 text-xs">
            ERC-8004 Risk Underwriter — LabLab AI Hackathon 2026 · $50K USDC Prize
          </p>
          <p className="text-gray-600 text-xs">Powered by Claude AI + ERC-8004 Standard</p>
        </div>
      </footer>
    </div>
  );
}
