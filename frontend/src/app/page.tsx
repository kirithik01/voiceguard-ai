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
      {/* Hero Banner with Warm Pastel Surface */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F3EEFB] p-8 sm:p-10 border border-[#E3DCF0] shadow-sm">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#B8A6E8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#A7D8D0]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>ENTERPRISE AUDIO FORENSICS & DEEPFAKE DEFENSE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#3A3450] leading-tight">
            AI-Powered Real-Time Voice Cloning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c63c7] via-[#3a8b80] to-[#2E9E5B]">
              Impersonation Attack Defense
            </span>
          </h1>

          <p className="text-[#7A7390] text-sm sm:text-base leading-relaxed font-normal">
            Protect high-stakes voice channels, executive authorization calls, and financial transactions
            against neural voice clones. VoiceGuard continuously extracts acoustic vocoder signatures,
            computes neural risk scores, and generates actionable security verifications.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              href="/live"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <Radio className="w-4 h-4 text-[#3A3450] animate-pulse" />
              <span>Launch Live Call Shield</span>
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#A7D8D0] hover:bg-[#8FC9BF] text-[#3A3450] font-bold text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4 text-[#3A3450]" />
              <span>Inspect Audio File</span>
            </Link>

            <Link
              href="/demo-lab"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FCE4E4] hover:bg-[#F9D2D2] text-[#D6395B] font-bold text-sm border border-[#D6395B] transition-all shadow-sm"
            >
              <Zap className="w-4 h-4 text-[#D6395B]" />
              <span>Judge Demo Lab</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Wiring & Connectivity Verification Card */}
      <section className="bg-[#F3EEFB] rounded-2xl p-6 border border-[#E3DCF0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCF0]">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-[#8E79C9]" />
            <div>
              <h2 className="text-base font-bold text-[#3A3450]">Full-Stack Core Wiring Status</h2>
              <p className="text-xs text-[#7A7390]">
                Phase 1 Scaffolding verification: Next.js Frontend ↔ FastAPI Python ML Core
              </p>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FBF7F4] hover:bg-[#EAF6F2] text-[#3A3450] transition-colors border border-[#E3DCF0] flex items-center space-x-1.5 shadow-sm"
          >
            <Activity className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#8E79C9]" : "text-[#7A7390]"}`} />
            <span>Re-probe Backend</span>
          </button>
        </div>

        <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status badge */}
          <div className="p-4 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#7A7390]">Connection State</span>
              <div className="mt-1 flex items-center space-x-2">
                {loading ? (
                  <span className="text-sm font-semibold text-[#C98A1F]">Probing /api/health...</span>
                ) : health ? (
                  <span className="text-sm font-bold text-[#2E9E5B] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Backend connected ✅</span>
                  </span>
                ) : (
                  <span className="text-sm font-bold text-[#D6395B] flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Backend not reachable ❌</span>
                  </span>
                )}
              </div>
            </div>
            {health && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]">
                {pingTime}ms
              </span>
            )}
          </div>

          {/* Model information */}
          <div className="p-4 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0]">
            <span className="text-xs font-mono text-[#7A7390]">ML Backbone Loaded</span>
            <div className="mt-1 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#8E79C9]" />
              <span className="text-xs font-mono font-semibold text-[#3A3450] truncate">
                {health?.model || "wav2vec2-deepfake-voice-detector"}
              </span>
            </div>
          </div>

          {/* Risk Thresholds */}
          <div className="p-4 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0]">
            <span className="text-xs font-mono text-[#7A7390]">Forensic Thresholds</span>
            <div className="mt-1 text-xs font-mono text-[#3A3450] flex items-center justify-between font-semibold">
              <span className="text-[#2E9E5B]">Low: &lt;{health?.thresholds.low_risk ?? 35}%</span>
              <span className="text-[#D6395B]">High: &gt;{health?.thresholds.high_risk ?? 65}%</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error} — ensure the FastAPI backend is running on port 8001.</span>
          </div>
        )}
      </section>

      {/* Feature Grid / Modules Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/live"
          className="group rounded-2xl bg-[#F3EEFB] p-5 border border-[#E3DCF0] hover:border-[#B8A6E8] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-[#B8A6E8]/30 border border-[#B8A6E8] flex items-center justify-center text-[#3A3450] mb-3 group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#3A3450] group-hover:text-[#7c63c7] flex items-center justify-between">
            <span>Live Call Shield</span>
            <ChevronRight className="w-4 h-4 text-[#7A7390] group-hover:text-[#7c63c7]" />
          </h3>
          <p className="text-xs text-[#7A7390] mt-1">
            Real-time mic capture with scrolling time-series risk score and instant audio alerts.
          </p>
        </Link>

        <Link
          href="/upload"
          className="group rounded-2xl bg-[#EAF6F2] p-5 border border-[#E3DCF0] hover:border-[#A7D8D0] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-[#A7D8D0]/40 border border-[#A7D8D0] flex items-center justify-center text-[#3A3450] mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#3A3450] group-hover:text-[#3a8b80] flex items-center justify-between">
            <span>Audio File Inspector</span>
            <ChevronRight className="w-4 h-4 text-[#7A7390] group-hover:text-[#3a8b80]" />
          </h3>
          <p className="text-xs text-[#7A7390] mt-1">
            Upload .wav, .mp3, .m4a files with full chunk-by-chunk acoustic forensic explanations.
          </p>
        </Link>

        <Link
          href="/history"
          className="group rounded-2xl bg-[#F3EEFB] p-5 border border-[#E3DCF0] hover:border-[#B8A6E8] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-[#B8A6E8]/30 border border-[#B8A6E8] flex items-center justify-center text-[#3A3450] mb-3 group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#3A3450] group-hover:text-[#7c63c7] flex items-center justify-between">
            <span>Threat Logs</span>
            <ChevronRight className="w-4 h-4 text-[#7A7390] group-hover:text-[#7c63c7]" />
          </h3>
          <p className="text-xs text-[#7A7390] mt-1">
            Persistent SQLite database of all historical voice scans, verdicts, and forensic details.
          </p>
        </Link>

        <Link
          href="/demo-lab"
          className="group rounded-2xl bg-[#FCE4E4] p-5 border border-[#D6395B]/40 hover:border-[#D6395B] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FCE4E4] border border-[#D6395B] flex items-center justify-center text-[#D6395B] mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#D6395B] flex items-center justify-between">
            <span>Judge Demo Lab</span>
            <ChevronRight className="w-4 h-4 text-[#D6395B]" />
          </h3>
          <p className="text-xs text-[#7A7390] mt-1">
            1-click test suite with preloaded Human & Synthetic voice samples for zero-fail judging.
          </p>
        </Link>
      </section>
    </div>
  );
}
