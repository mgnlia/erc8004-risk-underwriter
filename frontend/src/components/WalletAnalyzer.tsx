"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface Position {
  protocol: string;
  protocol_id: string;
  category: string;
  value_usd: number;
  apy: number;
  risk_score: number;
  chain: string;
}

interface Analysis {
  overall_risk_level: string;
  overall_risk_score: number;
  summary: string;
  key_risks: string[];
  recommendations: string[];
  diversification_score: number;
  liquidation_risk: string;
}

interface WalletResult {
  wallet: string;
  chain: string;
  total_value_usd: number;
  positions: Position[];
  position_count: number;
  analysis: Analysis;
  analyzed_at: string;
}

const EXAMPLE_WALLETS = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
];

function getRiskBadgeClass(level: string) {
  switch (level?.toLowerCase()) {
    case "low": return "badge-low";
    case "medium": return "badge-medium";
    case "high": return "badge-high";
    case "critical": return "badge-critical";
    default: return "badge-medium";
  }
}

function getRiskColor(score: number) {
  if (score < 25) return "#22c55e";
  if (score < 50) return "#eab308";
  if (score < 75) return "#f97316";
  return "#ef4444";
}

export default function WalletAnalyzer() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WalletResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async (addr?: string) => {
    const address = addr || wallet;
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API}/analyze-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: address }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Wallet Risk Analysis
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-[#0a0a14] border border-[#1e1e3f] rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            onClick={() => analyze()}
            disabled={loading || !wallet.trim()}
            className="btn-primary min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analyzing…
              </span>
            ) : "Analyze Risk"}
          </button>
        </div>

        {/* Example wallets */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-600">Try:</span>
          {EXAMPLE_WALLETS.map((w) => (
            <button
              key={w}
              onClick={() => { setWallet(w); analyze(w); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors"
            >
              {w.slice(0, 10)}…
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 bg-red-500/5">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Overview */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">{result.wallet}</p>
                <h3 className="text-xl font-bold text-white">
                  ${result.total_value_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{result.position_count} active positions · {result.chain}</p>
              </div>
              <div className="text-right">
                <span className={getRiskBadgeClass(result.analysis.overall_risk_level)}>
                  {result.analysis.overall_risk_level} Risk
                </span>
                <div className="mt-2 text-3xl font-bold" style={{ color: getRiskColor(result.analysis.overall_risk_score) }}>
                  {result.analysis.overall_risk_score}
                  <span className="text-sm text-gray-500 font-normal">/100</span>
                </div>
              </div>
            </div>

            {/* Risk bar */}
            <div className="risk-bar mb-1">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${result.analysis.overall_risk_score}%`,
                  backgroundColor: getRiskColor(result.analysis.overall_risk_score),
                }}
              />
            </div>

            <p className="text-sm text-gray-400 mt-4">{result.analysis.summary}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Positions", value: result.position_count, suffix: "" },
              { label: "Diversification", value: result.analysis.diversification_score, suffix: "/100" },
              { label: "Liquidation Risk", value: result.analysis.liquidation_risk, suffix: "", isText: true },
              { label: "Risk Score", value: result.analysis.overall_risk_score, suffix: "/100" },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">
                  {stat.value}{stat.suffix}
                </p>
              </div>
            ))}
          </div>

          {/* Positions */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Portfolio Positions
            </h3>
            <div className="space-y-3">
              {result.positions.map((pos) => (
                <div key={pos.protocol_id} className="flex items-center justify-between p-3 bg-[#0a0a14] rounded-lg border border-[#1e1e3f]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm">
                      {pos.category === "Lending" ? "🏦" : pos.category === "DEX" ? "🔄" : pos.category === "Liquid Staking" ? "💎" : pos.category === "Stablecoin" ? "💵" : "📈"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pos.protocol}</p>
                      <p className="text-xs text-gray-500">{pos.category} · {pos.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      ${pos.value_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-xs text-green-400">{pos.apy}% APY</span>
                      <span className="text-xs" style={{ color: getRiskColor(pos.risk_score) }}>
                        Risk: {pos.risk_score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                ⚠️ Key Risks
              </h3>
              <ul className="space-y-2">
                {result.analysis.key_risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                ✅ Recommendations
              </h3>
              <ul className="space-y-2">
                {result.analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Analyze Any Wallet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Enter a wallet address above to get an AI-powered risk assessment of DeFi positions,
            protocol exposure, and liquidation risk.
          </p>
        </div>
      )}
    </div>
  );
}
