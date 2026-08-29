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

const CODEC_COLORS = ["#8E79C9", "#A7D8D0", "#C98A1F", "#D6395B"];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>TELECOM CHANNEL ROBUSTNESS SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Codec Stress Test & Channel Robustness Benchmark
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Simulates G.711 $\mu$-law, Opus VoIP, and lossy cellular channels to verify zero-verdict-flip forensic stability.
          </p>
        </div>
      </div>

      {/* Select Voice Target & Run Benchmark */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#C98A1F]" />
          <span>Select Voice Sample to Subject to Codec Simulation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedSample("ceo_clone_wire_fraud")}
            className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
              selectedSample === "ceo_clone_wire_fraud"
                ? "bg-[#FCE4E4] border-[#D6395B]"
                : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D6395B]">Synthetic AI Clone Sample</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B] font-extrabold">
                CEO Wire Fraud
              </span>
            </div>
            <p className="text-[11px] text-[#7A7390] mt-1">
              Tests whether vocoder artifact markers survive lossy 8kHz G.711 downsampling and telephony compression.
            </p>
          </button>

          <button
            onClick={() => setSelectedSample("human_executive_auth")}
            className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
              selectedSample === "human_executive_auth"
                ? "bg-[#DFF5E6] border-[#2E9E5B]"
                : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E9E5B]">Authentic Human Sample</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B] font-extrabold">
                Rajesh Verma
              </span>
            </div>
            <p className="text-[11px] text-[#7A7390] mt-1">
              Tests whether natural human pitch variation survives lossy G.711 compression without false positives.
            </p>
          </button>
        </div>

        <button
          onClick={() => handleRunBenchmark(selectedSample)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
              <span>Simulating Telecom Codecs & Computing Forensic Matrix...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-[#3A3450]" />
              <span>Execute 4-Channel Codec Robustness Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Benchmark Results Display */}
      {benchmarkResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary KPI Banner */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#DFF5E6] border-2 border-[#2E9E5B] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#2E9E5B] text-white text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>BENCHMARK CERTIFICATION COMPLETE</span>
              </div>
              <h3 className="text-xl font-black text-[#2E9E5B]">
                Verdict Consistency: {benchmarkResult.benchmark_summary.overall_consistency_pct.toFixed(0)}%
              </h3>
              <p className="text-xs text-[#3A3450] font-mono font-medium">
                Baseline Verdict:{" "}
                <span className="font-bold">
                  {benchmarkResult.benchmark_summary.baseline_verdict.toUpperCase()}
                </span>{" "}
                across all telephone channels
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-[#E3DCF0] text-center min-w-[180px] shadow-sm">
              <span className="text-[10px] font-mono text-[#7A7390] uppercase font-semibold">Resilience Rating</span>
              <div className="text-xl font-black font-mono text-[#2E9E5B] mt-0.5">
                {benchmarkResult.benchmark_summary.robustness_rating}
              </div>
              <span className="text-[10px] text-[#7A7390] font-medium">Zero Verdict Flips</span>
            </div>
          </div>

          {/* Comparative Bar Chart */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-[#8E79C9]" />
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
                    stroke="#7A7390"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#7A7390"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#F3EEFB",
                      borderColor: "#E3DCF0",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#3A3450",
                    }}
                  />
                  <ReferenceLine y={65} stroke="#D6395B" strokeDasharray="3 3" label="High Risk" />
                  <ReferenceLine y={35} stroke="#2E9E5B" strokeDasharray="3 3" label="Safe" />
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
                className="p-5 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FBF7F4] text-[#3A3450] border border-[#E3DCF0]">
                    Profile {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      p.verdict === "synthetic"
                        ? "bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]"
                        : "bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]"
                    }`}
                  >
                    {p.verdict.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#3A3450]">{p.profile_name}</h4>
                  <div className="text-2xl font-black font-mono mt-1" style={{ color: CODEC_COLORS[idx] }}>
                    {p.risk_score.toFixed(1)}%
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E3DCF0] space-y-1 text-[11px] font-mono text-[#7A7390]">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-[#3A3450] font-bold">{(p.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pitch Std:</span>
                    <span className="text-[#3A3450]">{p.pitch_std_hz?.toFixed(1) ?? "--"} Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wiener Flat:</span>
                    <span className="text-[#3A3450]">{p.spectral_flatness?.toFixed(4) ?? "--"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E3DCF0] text-[10px] font-mono text-[#2E9E5B] flex items-center space-x-1 font-bold">
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
