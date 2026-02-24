"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface Protocol {
  id: string;
  name: string;
  category: string;
  tvl_usd: number;
  risk_score: number;
  audit_count: number;
  chain: string;
  description: string;
  last_audit: string;
  exploits: number;
  age_days: number;
}

interface DeepAnalysis {
  risk_breakdown: {
    smart_contract: number;
    liquidity: number;
    governance: number;
    oracle: number;
    economic: number;
  };
  threat_vectors: string[];
  historical_incidents: string[];
  audit_assessment: string;
  recommendation: string;
  confidence: string;
}

interface ProtocolDetail {
  protocol: Protocol;
  deep_analysis: DeepAnalysis;
  analyzed_at: string;
}

function getRiskColor(score: number) {
  if (score < 25) return "#22c55e";
  if (score < 50) return "#eab308";
  if (score < 75) return "#f97316";
  return "#ef4444";
}

function formatTVL(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "Lending": return "🏦";
    case "DEX": return "🔄";
    case "Liquid Staking": return "💎";
    case "Stablecoin": return "💵";
    case "Restaking": return "🔁";
    case "Yield Trading": return "📈";
    default: return "⚙️";
  }
}

function getRecommendationClass(rec: string) {
  switch (rec) {
    case "Low Risk": return "badge-low";
    case "Acceptable Risk": return "badge-medium";
    case "Use with Caution": return "badge-high";
    case "Avoid": return "badge-critical";
    default: return "badge-medium";
  }
}

export default function ProtocolExplorer() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProtocolDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch(`${API}/protocols`)
      .then((r) => r.json())
      .then((d) => setProtocols(d.protocols || []))
      .catch(() => setProtocols([]))
      .finally(() => setLoading(false));
  }, []);

  const analyzeProtocol = async (id: string) => {
    if (selected === id) {
      setSelected(null);
      setDetail(null);
      return;
    }
    setSelected(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`${API}/analyze-protocol`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocol_id: id }),
      });
      const data = await res.json();
      setDetail(data);
    } catch (_) {}
    finally {
      setDetailLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(protocols.map((p) => p.category)))];
  const filtered = filter === "All" ? protocols : protocols.filter((p) => p.category === filter);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-indigo-600 text-white"
                : "bg-[#111122] text-gray-400 border border-[#1e1e3f] hover:border-indigo-500/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-16 text-gray-500">Loading protocols…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="space-y-0">
              <button
                onClick={() => analyzeProtocol(p.id)}
                className={`w-full card text-left hover:border-indigo-500/50 transition-colors ${
                  selected === p.id ? "border-indigo-500/70 bg-indigo-500/5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(p.category)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.category} · {p.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: getRiskColor(p.risk_score) }}>
                      {p.risk_score}/100
                    </p>
                    <p className="text-xs text-gray-500">{formatTVL(p.tvl_usd)} TVL</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">{p.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                  <span>🔍 {p.audit_count} audits</span>
                  <span>⚠️ {p.exploits} exploits</span>
                  <span>📅 {p.age_days}d old</span>
                </div>

                {/* Risk bar */}
                <div className="risk-bar mt-3">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.risk_score}%`,
                      backgroundColor: getRiskColor(p.risk_score),
                    }}
                  />
                </div>
              </button>

              {/* Deep analysis panel */}
              {selected === p.id && (
                <div className="card border-t-0 rounded-t-none border-indigo-500/30 bg-indigo-500/5">
                  {detailLoading ? (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      <svg className="animate-spin h-5 w-5 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Running deep analysis…
                    </div>
                  ) : detail ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-indigo-300">Deep Risk Analysis</h4>
                        <span className={getRecommendationClass(detail.deep_analysis.recommendation)}>
                          {detail.deep_analysis.recommendation}
                        </span>
                      </div>

                      {/* Risk breakdown */}
                      <div className="space-y-2">
                        {Object.entries(detail.deep_analysis.risk_breakdown).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-28 capitalize">{key.replace("_", " ")}</span>
                            <div className="flex-1 risk-bar">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${val}%`,
                                  backgroundColor: getRiskColor(val as number),
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-400 w-8">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Threat vectors */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Threat Vectors</p>
                        <ul className="space-y-1">
                          {detail.deep_analysis.threat_vectors.map((t, i) => (
                            <li key={i} className="text-xs text-gray-400 flex gap-2">
                              <span className="text-orange-400">⚡</span>{t}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Audit assessment */}
                      <p className="text-xs text-gray-400 italic">{detail.deep_analysis.audit_assessment}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
