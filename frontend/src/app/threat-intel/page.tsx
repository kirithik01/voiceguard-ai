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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Globe className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>GLOBAL THREAT INTELLIGENCE & IMPERSONATION SYNDICATE TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Live Global Threat Intelligence Map
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Real-time geospatial radar tracking synthetic voice clone attacks across banking hubs and enterprise PBX networks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchThreatData}
            className="p-2 rounded-xl bg-[#F3EEFB] hover:bg-[#EAF6F2] text-[#7A7390] hover:text-[#3A3450] border border-[#E3DCF0] transition-colors"
            title="Refresh Feed"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-[#8E79C9]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Financial ROI & Attack Prevention Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Intercepted */}
        <div className="p-5 rounded-3xl bg-[#FCE4E4] border border-[#D6395B]/40 space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#D6395B] uppercase font-bold flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Attacks Intercepted</span>
          </span>
          <div className="text-2xl font-black text-[#D6395B] font-mono">
            {stats?.attacks_intercepted?.toLocaleString() ?? "1,429"}
          </div>
          <span className="text-[10px] text-[#D6395B]/80 font-medium">Neural clone vectors stopped</span>
        </div>

        {/* Fraud Loss Averted */}
        <div className="p-5 rounded-3xl bg-[#DFF5E6] border border-[#2E9E5B]/40 space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#2E9E5B] uppercase font-bold flex items-center space-x-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fraud Losses Averted</span>
          </span>
          <div className="text-2xl font-black text-[#2E9E5B] font-mono">
            {stats ? `$${(stats.total_fraud_averted_usd / 1000000).toFixed(2)}M+` : "$1.92M+"}
          </div>
          <span className="text-[10px] text-[#2E9E5B]/80 font-medium">Verified financial protection</span>
        </div>

        {/* Decision Latency */}
        <div className="p-5 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#7c63c7] uppercase font-bold flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Median Decision Latency</span>
          </span>
          <div className="text-2xl font-black text-[#7c63c7] font-mono">
            {stats?.avg_latency_ms ?? 138}ms
          </div>
          <span className="text-[10px] text-[#7A7390]">In-line telecom packet processing</span>
        </div>

        {/* Active Syndicates */}
        <div className="p-5 rounded-3xl bg-[#FDF3DA] border border-[#C98A1F]/40 space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#C98A1F] uppercase font-bold flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Active Syndicates</span>
          </span>
          <div className="text-2xl font-black text-[#C98A1F] font-mono">
            {stats?.active_syndicates_tracked ?? 7}
          </div>
          <span className="text-[10px] text-[#7A7390]">Clustering algorithms active</span>
        </div>

        {/* Blacklisted Numbers */}
        <div className="p-5 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 col-span-2 sm:col-span-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#7c63c7] uppercase font-bold flex items-center space-x-1">
            <Server className="w-3.5 h-3.5" />
            <span>SIP Blacklist Sync</span>
          </span>
          <div className="text-2xl font-black text-[#7c63c7] font-mono">
            {stats?.telecom_blacklisted_numbers ?? 28}
          </div>
          <span className="text-[10px] text-[#7A7390]">Propagated across trunks</span>
        </div>
      </div>

      {/* Cyber Threat Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Simulated Geographical Radar Canvas */}
        <div className="lg:col-span-2 rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#8E79C9]" />
                <span>Geographical Threat Node Activity</span>
              </h3>
              <p className="text-xs text-[#7A7390]">
                Click any banking node to inspect active voice cloning campaigns and vocoder signatures.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7390]">
              <span className="w-2 h-2 rounded-full bg-[#D6395B] animate-ping"></span>
              <span className="font-bold text-[#3A3450]">Live Sensor Grid</span>
            </div>
          </div>

          {/* Stylized SVG Map Frame */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-[#1E192E] border border-[#E3DCF0] overflow-hidden flex items-center justify-center p-4 shadow-inner">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d2545_1px,transparent_1px),linear-gradient(to_bottom,#2d2545_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

            {/* Simplified world landmass paths */}
            <svg
              className="w-full h-full text-[#3A3450]/40"
              viewBox="0 0 1000 500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
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
                          ? "bg-[#D6395B]"
                          : point.severity === "HIGH"
                          ? "bg-[#C98A1F]"
                          : "bg-[#8E79C9]"
                      }`}
                    ></span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 border-white transition-transform ${
                        point.severity === "CRITICAL"
                          ? "bg-[#D6395B]"
                          : point.severity === "HIGH"
                          ? "bg-[#C98A1F]"
                          : "bg-[#8E79C9]"
                      } ${isSelected ? "scale-150 ring-2 ring-white" : "group-hover:scale-125"}`}
                    ></span>
                  </div>

                  {/* Marker Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-5 hidden group-hover:block whitespace-nowrap px-2.5 py-1 rounded-xl bg-[#F3EEFB] border border-[#E3DCF0] text-[10px] font-mono font-bold text-[#3A3450] z-20 shadow-lg">
                    {point.city}: {point.threat_vector}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Node Threat Dossier */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#8E79C9]" />
            <span>Target Node Telemetry</span>
          </h2>

          {selectedHub ? (
            <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#E3DCF0] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#3A3450]">{selectedHub.hub_name}</h3>
                  <p className="text-xs text-[#7c63c7] font-mono font-semibold">
                    {selectedHub.city}, {selectedHub.country}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedHub.severity === "CRITICAL"
                      ? "bg-[#FCE4E4] text-[#D6395B] border-[#D6395B]"
                      : selectedHub.severity === "HIGH"
                      ? "bg-[#FDF3DA] text-[#C98A1F] border-[#C98A1F]"
                      : "bg-[#DFF5E6] text-[#2E9E5B] border-[#2E9E5B]"
                  }`}
                >
                  {selectedHub.severity}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#E3DCF0]">
                  <span className="text-[#7A7390]">Threat Scenario:</span>
                  <span className="text-[#3A3450] font-bold text-right truncate max-w-[170px]">
                    {selectedHub.threat_vector}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E3DCF0]">
                  <span className="text-[#7A7390]">Vocoder Architecture:</span>
                  <span className="text-[#D6395B] font-bold">{selectedHub.vocoder_signature}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E3DCF0]">
                  <span className="text-[#7A7390]">Target Sector:</span>
                  <span className="text-[#3A3450] font-bold">{selectedHub.target_sector}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E3DCF0]">
                  <span className="text-[#7A7390]">Threat Level:</span>
                  <span className="text-[#D6395B] font-bold">{selectedHub.severity}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] text-[11px] text-[#3A3450] font-medium leading-relaxed shadow-xs">
                Acoustic telemetry indicates coordinated vocoder impersonation targeting executive authorization channels.
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-6 bg-[#F3EEFB] border border-[#E3DCF0] text-center text-xs text-[#7A7390] shadow-sm">
              Select a node on the radar map to view forensic vector telemetry.
            </div>
          )}

          {/* Live Intercept Ticker Feed */}
          <div className="rounded-3xl bg-[#F3EEFB] p-5 border border-[#E3DCF0] space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-[#C98A1F]" />
              <span>Real-Time Inbound Intercept Ticker</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {feed.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-[11px] font-mono space-y-0.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#7c63c7] font-bold">{item.origin_hub}</span>
                    <span className="text-[10px] text-[#7A7390]">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[#3A3450] font-medium truncate">{item.target_sector} - {item.channel}</p>
                  <div className="flex items-center justify-between pt-0.5 text-[10px]">
                    <span className="text-[#D6395B] font-bold">{item.vocoder_family}</span>
                    <span className="text-[#2E9E5B] font-semibold">{item.verdict.toUpperCase()} ({item.risk_score.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
