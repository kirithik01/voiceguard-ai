"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Radio, 
  Upload, 
  History, 
  Zap, 
  Cpu, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Server
} from "lucide-react";
import { checkHealth } from "@/lib/api";
import { HealthResponse } from "@/lib/types";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pingTime, setPingTime] = useState<number>(0);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await checkHealth();
      setPingTime(Math.round(performance.now() - start));
      setHealth(data);
    } catch (err: any) {
      setError(err.message || "Failed to reach backend API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner with Cyber Security Styling */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-8 border border-cyan-500/20 cyber-glow-cyan">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE AUDIO FORENSICS & DEEPFAKE DEFENSE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered Real-Time Voice Cloning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Impersonation Attack Defense
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Protect high-stakes voice channels, executive authorization calls, and financial transactions
            against neural voice clones. VoiceGuard continuously extracts acoustic vocoder signatures,
            computes neural risk scores, and generates actionable security verifications.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              href="/live"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Launch Live Call Shield</span>
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Inspect Audio File</span>
            </Link>

            <Link
              href="/demo-lab"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-sm border border-rose-500/30 transition-all"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>Judge Demo Lab</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Wiring & Connectivity Verification Card (Phase 1 Deliverable) */}
      <section className="glass-panel rounded-xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">Full-Stack Core Wiring Status</h2>
              <p className="text-xs text-slate-400">
                Phase 1 Scaffolding verification: Next.js Frontend ↔ FastAPI Python ML Core
              </p>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center space-x-1.5"
          >
            <Activity className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : "text-slate-400"}`} />
            <span>Re-probe Backend</span>
          </button>
        </div>

        <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status badge */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Connection State</span>
              <div className="mt-1 flex items-center space-x-2">
                {loading ? (
                  <span className="text-sm font-semibold text-amber-400">Probing /api/health...</span>
                ) : health ? (
                  <span className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Backend connected ✅</span>
                  </span>
                ) : (
                  <span className="text-sm font-bold text-rose-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Backend not reachable ❌</span>
                  </span>
                )}
              </div>
            </div>
            {health && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {pingTime}ms
              </span>
            )}
          </div>

          {/* Model information */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">ML Backbone Loaded</span>
            <div className="mt-1 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-200 truncate">
                {health?.model || "wav2vec2-deepfake-voice-detector"}
              </span>
            </div>
          </div>

          {/* Risk Thresholds */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Forensic Thresholds</span>
            <div className="mt-1 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="text-emerald-400">Low: &lt;{health?.thresholds.low_risk ?? 35}%</span>
              <span className="text-rose-400">High: &gt;{health?.thresholds.high_risk ?? 65}%</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error} — ensure the FastAPI backend is running on port 8001.</span>
          </div>
        )}
      </section>

      {/* Feature Grid / Modules Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/live"
          className="group glass-panel rounded-xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
            <span>Live Call Shield</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time mic capture with scrolling time-series risk score and instant audio alerts.
          </p>
        </Link>

        <Link
          href="/upload"
          className="group glass-panel rounded-xl p-5 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-blue-300 flex items-center justify-between">
            <span>Audio File Inspector</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Upload .wav, .mp3, .m4a files with full chunk-by-chunk acoustic forensic explanations.
          </p>
        </Link>

        <Link
          href="/history"
          className="group glass-panel rounded-xl p-5 border border-slate-800 hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-teal-300 flex items-center justify-between">
            <span>Threat Logs</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Persistent SQLite database of all historical voice scans, verdicts, and forensic details.
          </p>
        </Link>

        <Link
          href="/demo-lab"
          className="group glass-panel rounded-xl p-5 border border-slate-800 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-rose-300 flex items-center justify-between">
            <span>Judge Demo Lab</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            1-click test suite with preloaded Human & Synthetic voice samples for zero-fail judging.
          </p>
        </Link>
      </section>
    </div>
  );
}
