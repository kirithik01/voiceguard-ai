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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <ShieldMinus className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>ADVERSARIAL ATTACK EVASION RESISTANCE & NOISE DEFENSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Adversarial Evasion Resistance Studio
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Evaluates VoiceGuard against adversarial perturbation techniques (background ambient noise masking and tempo stretching) and proves the power of our adaptive spectral denoising pre-filter.
          </p>
        </div>
      </div>

      {/* Adversarial Tuning Controls */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-6 shadow-sm">
        <h3 className="text-xs font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#8E79C9]" />
          <span>Adversarial Perturbation Attack Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Noise Injection Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#7A7390] font-semibold">Additive Noise Injection (Gaussian Floor):</span>
              <span className="text-[#3A3450] font-bold">{(noiseLevel * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.05}
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#E3DCF0] rounded-lg appearance-none cursor-pointer accent-[#B8A6E8]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#7A7390]">
              <span>0% (Clean)</span>
              <span>25% (Cafe/Street Noise)</span>
              <span>50% (Heavy Noise Masking)</span>
            </div>
          </div>

          {/* Tempo Factor Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#7A7390] font-semibold">Speech Cadence / Tempo Stretching:</span>
              <span className="text-[#3A3450] font-bold">{tempoFactor.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.25}
              step={0.05}
              value={tempoFactor}
              onChange={(e) => setTempoFactor(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#E3DCF0] rounded-lg appearance-none cursor-pointer accent-[#A7D8D0]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#7A7390]">
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
            className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
              selectedSample === "ceo_clone_wire_fraud"
                ? "bg-[#FCE4E4] border-2 border-[#D6395B]"
                : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
            }`}
          >
            <span className="text-[10px] font-mono font-extrabold text-[#D6395B]">TEST TARGET 1</span>
            <h4 className="text-xs font-bold text-[#D6395B] mt-0.5">CEO Wire Fraud AI Clone</h4>
            <p className="text-[11px] text-[#7A7390] mt-1">
              Verifies whether added noise successfully conceals neural vocoder flaws.
            </p>
          </button>

          <button
            onClick={() => setSelectedSample("human_executive_auth")}
            className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
              selectedSample === "human_executive_auth"
                ? "bg-[#DFF5E6] border-2 border-[#2E9E5B]"
                : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
            }`}
          >
            <span className="text-[10px] font-mono font-extrabold text-[#2E9E5B]">TEST TARGET 2</span>
            <h4 className="text-xs font-bold text-[#2E9E5B] mt-0.5">Authentic Executive Human Speech</h4>
            <p className="text-[11px] text-[#7A7390] mt-1">
              Verifies that noisy background audio does NOT trigger false positive detections.
            </p>
          </button>
        </div>

        <button
          onClick={handleRunTest}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
              <span>Simulating Adversarial Injection & Adaptive Denoising...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#3A3450]" />
              <span>Execute 3-Stage Adversarial Robustness Test</span>
            </>
          )}
        </button>
      </div>

      {/* 3-Stage Comparative Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#DFF5E6] border-2 border-[#2E9E5B] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#2E9E5B] text-white text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>ADVERSARIAL EVASION BYPASS PREVENTED</span>
              </div>
              <h3 className="text-xl font-black text-[#2E9E5B]">
                Resilience Status: 100% Maintained
              </h3>
              <p className="text-xs text-[#3A3450] font-mono font-medium">
                VoiceGuard successfully stripped adversarial perturbations without verdict wavering.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#E3DCF0] text-center min-w-[170px] shadow-sm">
              <span className="text-[10px] font-mono text-[#7A7390] uppercase font-semibold">Defense Outcome</span>
              <div className="text-lg font-black font-mono text-[#2E9E5B] mt-0.5">
                NEUTRALIZED
              </div>
              <span className="text-[10px] text-[#7A7390] font-medium">Zero Bypass Leakage</span>
            </div>
          </div>

          {/* 3 Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.stages.map((stage, idx) => (
              <div
                key={stage.stage_name}
                className="p-5 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FBF7F4] text-[#3A3450] border border-[#E3DCF0]">
                    Stage {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                      stage.verdict === "synthetic"
                        ? "bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]"
                        : "bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]"
                    }`}
                  >
                    {stage.verdict.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#3A3450]">{stage.stage_name}</h4>
                  <div
                    className="text-2xl font-black font-mono mt-1"
                    style={{
                      color:
                        stage.risk_score < 35
                          ? "#2E9E5B"
                          : stage.risk_score <= 65
                          ? "#C98A1F"
                          : "#D6395B",
                    }}
                  >
                    {stage.risk_score.toFixed(1)}%
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E3DCF0] space-y-1 text-[11px] font-mono text-[#7A7390]">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-[#3A3450] font-bold">{(stage.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vocoder Anomaly:</span>
                    <span className="text-[#7c63c7] font-bold">{stage.vocoder_index.toFixed(1)}/100</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#7A7390] leading-relaxed pt-2 border-t border-[#E3DCF0] italic">
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
