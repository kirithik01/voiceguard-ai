"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Radio,
  RotateCcw,
  Zap,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Server
} from "lucide-react";
import { getThreatIntelStats, getThreatIntelMap, getThreatIntelFeed } from "@/lib/api";
import { ThreatIntelStats, ThreatGeoPoint, ThreatFeedItem } from "@/lib/types";

export default function ThreatIntelPage() {
  const [stats, setStats] = useState<ThreatIntelStats | null>(null);
  const [geoPoints, setGeoPoints] = useState<ThreatGeoPoint[]>([]);
  const [feed, setFeed] = useState<ThreatFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedHub, setSelectedHub] = useState<ThreatGeoPoint | null>(null);

  useEffect(() => {
    fetchThreatData();
  }, []);

  const fetchThreatData = async () => {
    setLoading(true);
    try {
      const [s, m, f] = await Promise.all([
        getThreatIntelStats(),
        getThreatIntelMap(),
        getThreatIntelFeed(),
      ]);
      setStats(s);
      setGeoPoints(m);
      setFeed(f);
      if (m.length > 0) setSelectedHub(m[0]);
    } catch (err) {
      console.error("Failed to load threat intel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 mb-2">
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            <span>GLOBAL THREAT INTELLIGENCE & IMPERSONATION SYNDICATE TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cyber Threat Intelligence Map
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time global telemetry tracking coordinated neural voice cloning campaigns targeting enterprise banking, executive treasury corridors, and SaaS identity infrastructure.
          </p>
        </div>

        <button
          onClick={fetchThreatData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Live Intel</span>
        </button>
      </div>

      {/* KPI Ticker Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Fraud Averted USD */}
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/40 space-y-1 cyber-glow-green">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center space-x-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fraud Losses Averted</span>
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${stats ? (stats.total_fraud_averted_usd / 1000000).toFixed(2) : "1.85"}M
          </div>
          <span className="text-[10px] text-emerald-400/80">Direct capital protected</span>
        </div>

        {/* Attacks Intercepted */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-rose-400 uppercase font-bold flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Attacks Intercepted</span>
          </span>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {stats?.attacks_intercepted ?? 14}
          </div>
          <span className="text-[10px] text-slate-500">Autonomous blocks enforced</span>
        </div>

        {/* Avg Latency */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Average Decision Time</span>
          </span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {stats?.avg_latency_ms ?? 138} ms
          </div>
          <span className="text-[10px] text-slate-500">In-line telecom speed</span>
        </div>

        {/* Active Syndicates */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Active Syndicates</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {stats?.active_syndicates_tracked ?? 7}
          </div>
          <span className="text-[10px] text-slate-500">Clustering algorithms active</span>
        </div>

        {/* Blacklisted Numbers */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center space-x-1">
            <Server className="w-3.5 h-3.5" />
            <span>SIP Blacklist Sync</span>
          </span>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">
            {stats?.telecom_blacklisted_numbers ?? 28}
          </div>
          <span className="text-[10px] text-slate-500">Propagated across trunks</span>
        </div>
      </div>

      {/* Cyber Threat Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Simulated Geographical Radar Canvas */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Geographical Threat Node Activity</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any banking node to inspect active voice cloning campaigns and vocoder signatures.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Live Sensor Grid</span>
            </div>
          </div>

          {/* Stylized SVG Map Frame */}
          <div className="relative w-full h-80 sm:h-96 rounded-xl bg-[#060911] border border-slate-800 overflow-hidden flex items-center justify-center p-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

            {/* Simulated World/Regional Continents SVG Outline */}
            <svg
              className="w-full h-full text-slate-800/60"
              viewBox="0 0 1000 500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              {/* Simplified world landmass paths */}
              <path d="M150,120 Q220,100 280,140 Q320,180 300,260 Q260,320 200,340 Q150,300 130,220 Z" />
              <path d="M220,330 Q260,320 300,380 Q320,440 280,480 Q240,460 220,400 Z" />
              <path d="M480,100 Q560,90 620,140 Q640,200 580,260 Q520,240 470,180 Z" />
              <path d="M480,240 Q580,260 620,340 Q600,420 540,460 Q480,400 460,300 Z" />
              <path d="M640,120 Q780,100 880,160 Q900,260 820,340 Q740,300 680,200 Z" />
              <path d="M720,240 Q760,260 780,320 Q740,360 700,320 Z" />
              <path d="M780,360 Q860,350 900,400 Q880,460 820,460 Q760,420 780,360 Z" />
            </svg>

            {/* Radar Coordinates Overlay */}
            {geoPoints.map((point) => {
              const isSelected = selectedHub?.id === point.id;
              // Map lat/lng coordinates to percentage offsets
              const xPercent = ((point.lng + 180) / 360) * 100;
              const yPercent = ((90 - point.lat) / 180) * 100;

              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedHub(point)}
                  className="absolute cursor-pointer group"
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`absolute w-6 h-6 rounded-full animate-ping opacity-60 ${
                        point.severity === "CRITICAL"
                          ? "bg-rose-500"
                          : point.severity === "HIGH"
                          ? "bg-amber-500"
                          : "bg-cyan-500"
                      }`}
                    ></span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 transition-transform ${
                        point.severity === "CRITICAL"
                          ? "bg-rose-500"
                          : point.severity === "HIGH"
                          ? "bg-amber-500"
                          : "bg-cyan-500"
                      } ${isSelected ? "scale-150 ring-2 ring-white" : "group-hover:scale-125"}`}
                    ></span>
                  </div>

                  {/* Marker Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-5 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-mono text-white z-20 shadow-lg">
                    {point.city}: {point.threat_vector}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Node Threat Dossier */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Target Node Telemetry</span>
          </h2>

          {selectedHub ? (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedHub.hub_name}</h3>
                  <p className="text-xs text-cyan-400 font-mono">
                    {selectedHub.city}, {selectedHub.country}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    selectedHub.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : selectedHub.severity === "HIGH"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  {selectedHub.severity}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-slate-500">Target Industry:</span>
                  <p className="text-white font-semibold">{selectedHub.target_sector}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500">Active Attack Vector:</span>
                  <p className="text-rose-300 font-semibold">{selectedHub.threat_vector}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500">Neural Vocoder Signature:</span>
                  <p className="text-cyan-300">{selectedHub.vocoder_signature}</p>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800/80 flex justify-between text-slate-400">
                  <span>Last Intercept:</span>
                  <span className="text-emerald-400 font-bold">{selectedHub.last_intercept}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-xs text-slate-500">
              Select a node on the map to inspect live threat intel.
            </div>
          )}
        </div>
      </div>

      {/* Live Intercept Streaming Feed */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Live Intercept Feed & Syndicated Telemetry</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Last 25 Intercepted Streams</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Target Sector</th>
                <th className="py-3 px-4">Channel / File</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Vocoder Family</th>
                <th className="py-3 px-4 text-right">Averted Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/40">
              {feed.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-white font-sans font-semibold">
                    {item.target_sector}
                  </td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]">
                    {item.channel}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {item.verdict === "synthetic" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        SYNTHETIC
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        GENUINE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span
                      style={{
                        color:
                          item.risk_score < 35
                            ? "#10b981"
                            : item.risk_score <= 65
                            ? "#f59e0b"
                            : "#f43f5e",
                      }}
                    >
                      {item.risk_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cyan-300">{item.vocoder_family}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                    {item.averted_loss_usd > 0
                      ? `$${item.averted_loss_usd.toLocaleString()}`
                      : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
