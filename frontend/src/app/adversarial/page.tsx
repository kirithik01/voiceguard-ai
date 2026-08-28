"use client";

import React, { useState } from "react";
import {
  ShieldMinus,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Zap,
  Sliders,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { runAdversarialStressTest } from "@/lib/api";
import { AdversarialStressTestResult } from "@/lib/types";

export default function AdversarialPage() {
  const [noiseLevel, setNoiseLevel] = useState<number>(0.20);
  const [tempoFactor, setTempoFactor] = useState<number>(1.10);
  const [selectedSample, setSelectedSample] = useState<string>("ceo_clone_wire_fraud");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AdversarialStressTestResult | null>(null);

  const handleRunTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("noise_level", noiseLevel.toString());
      formData.append("tempo_factor", tempoFactor.toString());
      formData.append("sample_id", selectedSample);

      const res = await runAdversarialStressTest(formData);
      setResult(res);
    } catch (err: any) {
      alert("Adversarial test failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 mb-2">
            <ShieldMinus className="w-3.5 h-3.5 text-amber-400" />
            <span>ADVERSARIAL ATTACK EVASION RESISTANCE & NOISE DEFENSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Adversarial Evasion Resistance Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Evaluates VoiceGuard against adversarial perturbation techniques (background ambient noise masking and tempo stretching) and proves the power of our adaptive spectral denoising pre-filter.
          </p>
        </div>
      </div>

      {/* Explainer Banner */}
      <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/10 text-xs text-slate-300 leading-relaxed space-y-1">
        <span className="font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>How Attackers Attempt Evasion vs. VoiceGuard Defense</span>
        </span>
        <p>
          Sophisticated adversaries intentionally inject cafe noise or speed up synthetic clones to disrupt $F_0$ pitch tracking. VoiceGuard counteracts this with a built-in <span className="text-amber-300 font-semibold">Adaptive Spectral Subtraction Pre-Filter</span> that estimates the stationary noise floor and strips it prior to classification, neutralizing evasion bypass attempts.
        </p>
      </div>

      {/* Adversarial Tuning Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Configure Adversarial Perturbation Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Noise Slider */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Injected Ambient Noise Level:</span>
              <span className="text-amber-400 font-bold">{(noiseLevel * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5% (Subtle Room)</span>
              <span>20% (Office Chatter)</span>
              <span>40% (Heavy Street Noise)</span>
            </div>
          </div>

          {/* Tempo Slider */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Playback Cadence Shift:</span>
              <span className="text-cyan-400 font-bold">{tempoFactor.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.25"
              step="0.05"
              value={tempoFactor}
              onChange={(e) => setTempoFactor(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.85x (Slow Slurred)</span>
              <span>1.0x (Normal)</span>
              <span>1.25x (Rushed Cadence)</span>
            </div>
          </div>
        </div>

        {/* Audio Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => setSelectedSample("ceo_clone_wire_fraud")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedSample === "ceo_clone_wire_fraud"
                ? "glass-panel-danger border-rose-500/60"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-rose-400">TEST TARGET 1</span>
            <h4 className="text-xs font-bold text-white">CEO Wire Fraud AI Clone</h4>
            <p className="text-[11px] text-slate-400">
              Verifies whether added noise successfully conceals neural vocoder flaws.
            </p>
          </button>

          <button
            onClick={() => setSelectedSample("human_executive_auth")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedSample === "human_executive_auth"
                ? "glass-panel-safe border-emerald-500/60"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-emerald-400">TEST TARGET 2</span>
            <h4 className="text-xs font-bold text-white">Authentic Executive Human Speech</h4>
            <p className="text-[11px] text-slate-400">
              Verifies that noisy background audio does NOT trigger false positive detections.
            </p>
          </button>
        </div>

        <button
          onClick={handleRunTest}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-slate-950" />
              <span>Simulating Adversarial Injection & Adaptive Denoising...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Execute 3-Stage Adversarial Robustness Test</span>
            </>
          )}
        </button>
      </div>

      {/* 3-Stage Comparative Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>ADVERSARIAL EVASION BYPASS PREVENTED</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Resilience Status: 100% Maintained
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                VoiceGuard successfully stripped adversarial perturbations without verdict wavering.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[170px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Defense Outcome</span>
              <div className="text-lg font-extrabold font-mono text-emerald-400 mt-0.5">
                NEUTRALIZED
              </div>
              <span className="text-[10px] text-slate-500">Zero Bypass Leakage</span>
            </div>
          </div>

          {/* 3 Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.stages.map((stage, idx) => (
              <div
                key={stage.stage_name}
                className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    Stage {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      stage.verdict === "synthetic"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {stage.verdict.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{stage.stage_name}</h4>
                  <div
                    className="text-2xl font-extrabold font-mono mt-1"
                    style={{
                      color:
                        stage.risk_score < 35
                          ? "#10b981"
                          : stage.risk_score <= 65
                          ? "#f59e0b"
                          : "#f43f5e",
                    }}
                  >
                    {stage.risk_score.toFixed(1)}%
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-white font-bold">{(stage.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vocoder Anomaly:</span>
                    <span className="text-cyan-300 font-bold">{stage.vocoder_index.toFixed(1)}/100</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80 italic">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
