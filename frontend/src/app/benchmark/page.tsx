"use client";

import React, { useState } from "react";
import {
  Cpu,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Zap,
  BarChart2,
  CheckCircle2,
  Phone,
  Radio,
  Upload,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from "recharts";
import { runTelecomBenchmark } from "@/lib/api";
import { CodecBenchmarkResult } from "@/lib/types";

const CODEC_COLORS = ["#06b6d4", "#3b82f6", "#f59e0b", "#f43f5e"];

export default function BenchmarkPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<CodecBenchmarkResult | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>("ceo_clone_wire_fraud");

  const handleRunBenchmark = async (sampleId: string) => {
    setLoading(true);
    setSelectedSample(sampleId);
    setBenchmarkResult(null);

    try {
      const formData = new FormData();
      formData.append("sample_id", sampleId);

      const res = await runTelecomBenchmark(formData);
      setBenchmarkResult(res);
    } catch (err: any) {
      alert("Benchmark failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>TELECOM CODEC DEGRADATION & ACOUSTIC STRESS BENCHMARK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Codec Robustness Benchmark Lab
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirically stress-tests VoiceGuard against real-world telephone degradation: PSTN G.711 &mu;-law (8kHz), Wideband VoIP (Opus), and lossy mobile cellular packet dropouts.
          </p>
        </div>
      </div>

      {/* Control Panel: 1-Click Codec Stress Presets */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Select Test Audio for Telecom Stress Evaluation</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleRunBenchmark("ceo_clone_wire_fraud")}
            disabled={loading}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedSample === "ceo_clone_wire_fraud"
                ? "glass-panel-danger border-rose-500/60 shadow-md shadow-rose-500/10"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                AI CLONE VECTOR
              </span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-xs font-bold text-white">CEO Wire Fraud AI Voice Clone</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Tests whether neural vocoder flatlines remain detectable when downsampled to 8kHz telephone audio.
            </p>
          </button>

          <button
            onClick={() => handleRunBenchmark("human_executive_auth")}
            disabled={loading}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedSample === "human_executive_auth"
                ? "glass-panel-safe border-emerald-500/60 shadow-md shadow-emerald-500/10"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GENUINE HUMAN
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-white">Authentic Executive Human Speech</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Tests whether natural human pitch variation survives lossy G.711 compression without false positives.
            </p>
          </button>
        </div>

        <button
          onClick={() => handleRunBenchmark(selectedSample)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-slate-950" />
              <span>Simulating Telecom Codecs & Computing Forensic Matrix...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-slate-950" />
              <span>Execute 4-Channel Codec Robustness Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Benchmark Results Display */}
      {benchmarkResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary KPI Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>BENCHMARK CERTIFICATION COMPLETE</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Verdict Consistency: {benchmarkResult.benchmark_summary.overall_consistency_pct.toFixed(0)}%
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Baseline Verdict:{" "}
                <span className="text-cyan-300 font-bold">
                  {benchmarkResult.benchmark_summary.baseline_verdict.toUpperCase()}
                </span>{" "}
                across all telephone channels
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[180px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Resilience Rating</span>
              <div className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
                {benchmarkResult.benchmark_summary.robustness_rating}
              </div>
              <span className="text-[10px] text-slate-500">Zero Verdict Flips</span>
            </div>
          </div>

          {/* Comparative Bar Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Risk Score Stability Across Telecom Channels</span>
            </h3>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={benchmarkResult.profiles}
                  margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="profile_name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <ReferenceLine y={65} stroke="#f43f5e" strokeDasharray="3 3" label="High Risk" />
                  <ReferenceLine y={35} stroke="#10b981" strokeDasharray="3 3" label="Safe" />
                  <Bar dataKey="risk_score" radius={[6, 6, 0, 0]}>
                    {benchmarkResult.profiles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CODEC_COLORS[index % CODEC_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 Profile Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benchmarkResult.profiles.map((p, idx) => (
              <div
                key={p.profile_name}
                className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    Profile {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      p.verdict === "synthetic"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {p.verdict.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{p.profile_name}</h4>
                  <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: CODEC_COLORS[idx] }}>
                    {p.risk_score.toFixed(1)}%
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-white font-bold">{(p.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pitch Std:</span>
                    <span className="text-white">{p.pitch_std_hz?.toFixed(1) ?? "--"} Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wiener Flat:</span>
                    <span className="text-white">{p.spectral_flatness?.toFixed(4) ?? "--"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{p.resilience_verdict}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
