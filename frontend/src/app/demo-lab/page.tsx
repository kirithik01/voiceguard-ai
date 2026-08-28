"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Zap,
  Activity,
  Bot,
  UserCheck,
  Radio,
  Download,
  ArrowRight,
  Fingerprint,
  RefreshCw,
  Cpu,
  Layers,
  Volume2
} from "lucide-react";
import {
  getDemoSamples,
  runDemoSample,
  generateCustomTTS,
  getSampleAudioUrl
} from "@/lib/api";
import { DemoSample, AnalyzeResult } from "@/lib/types";
import SpectrogramViewer from "@/components/SpectrogramViewer";

export default function DemoLabPage() {
  const [samples, setSamples] = useState<DemoSample[]>([]);
  const [loadingSamples, setLoadingSamples] = useState<boolean>(true);
  const [runningSampleId, setRunningSampleId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<AnalyzeResult | null>(null);

  // Audio preview
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Custom TTS Synthesizer state
  const [customPrompt, setCustomPrompt] = useState<string>(
    "This is the Chief Financial Officer. I need an urgent wire transfer of $450,000 approved to our offshore vendor right now."
  );
  const [selectedVoice, setSelectedVoice] = useState<string>("en-US-ChristopherNeural");
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoadingSamples(true);
    try {
      const data = await getDemoSamples();
      setSamples(data);
    } catch (err) {
      console.error("Failed to load demo samples:", err);
    } finally {
      setLoadingSamples(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      if (playingAudioUrl === url && !audioRef.current.paused) {
        audioRef.current.pause();
        setPlayingAudioUrl(null);
      } else {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAudioUrl(url);
      }
    }
  };

  const handleRunSample = async (sample: DemoSample) => {
    setRunningSampleId(sample.id);
    setActiveResult(null);
    try {
      const audioUrl = getSampleAudioUrl(sample.id);
      playAudio(audioUrl);
      const res = await runDemoSample(sample.id);
      setActiveResult(res);
    } catch (err: any) {
      alert("Error evaluating sample: " + err.message);
    } finally {
      setRunningSampleId(null);
    }
  };

  const handleGenerateTTS = async () => {
    if (!customPrompt.trim()) return;
    setTtsLoading(true);
    setTtsError(null);
    setActiveResult(null);
    try {
      const resp = await generateCustomTTS(customPrompt, selectedVoice);
      const fullAudioUrl = resp.audio_url.startsWith("http")
        ? resp.audio_url
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}${resp.audio_url}`;
      playAudio(fullAudioUrl);
      setActiveResult(resp.result);
    } catch (err: any) {
      setTtsError(err.message || "Failed to synthesize AI clone speech.");
    } finally {
      setTtsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 35) return "#10b981";
    if (score <= 65) return "#f59e0b";
    return "#f43f5e";
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto pb-12">
      <audio ref={audioRef} onEnded={() => setPlayingAudioUrl(null)} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>SIH JUDGE EVALUATION & ZERO-FAIL DEMO LAB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Judge Demo Lab & Attack Testbed
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Zero-friction 1-click evaluation suite with preloaded attack vectors and real-time custom AI voice clone synthesis.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/about"
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-2"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Architecture Specs</span>
          </Link>
        </div>
      </div>

      {/* Section 1: Pre-Packaged Attack Vectors (1-Click Testbed) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Preloaded Scenarios (1-Click Instant Evaluation)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any pre-configured voice vector to hear playback and observe instant forensic classification.
            </p>
          </div>

          <button
            onClick={fetchSamples}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reload Scenarios"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSamples ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>

        {loadingSamples ? (
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center">
            <Activity className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Loading attack scenario catalog...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {samples.map((sample) => {
              const audioUrl = getSampleAudioUrl(sample.id);
              const isPlayingThis = playingAudioUrl === audioUrl;
              const isRunningThis = runningSampleId === sample.id;
              const isSynthetic = sample.expected_verdict === "synthetic";

              return (
                <div
                  key={sample.id}
                  className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                    isSynthetic
                      ? "hover:border-rose-500/50 hover:shadow-rose-500/10"
                      : "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isSynthetic
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {sample.threat_level} • {sample.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {sample.duration_sec}s
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{sample.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 space-y-3">
                    {/* Audio Playback Toggle */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playAudio(audioUrl)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
                      >
                        {isPlayingThis ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Preview Audio</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Run Forensic Evaluation Button */}
                    <button
                      onClick={() => handleRunSample(sample)}
                      disabled={isRunningThis}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                        isSynthetic
                          ? "bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-slate-950 shadow-rose-500/20"
                          : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20"
                      }`}
                    >
                      {isRunningThis ? (
                        <>
                          <Activity className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing Vector...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Simulate Attack & Evaluate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Live AI Voice Clone Synthesizer (Zero-Day Judge Sandbox) */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 cyber-glow-cyan space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Live AI Voice Clone Synthesizer (Judge Custom Attack Sandbox)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Type any prompt to generate a synthetic neural voice clone with Edge-TTS and witness VoiceGuard intercept it.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Attacker Speech Prompt (What the AI Clone Speaks):
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter speech prompt..."
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-mono text-slate-400">Neural Model:</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="en-US-ChristopherNeural">en-US-ChristopherNeural (Male Executive)</option>
                <option value="en-US-JennyNeural">en-US-JennyNeural (Female Financial Officer)</option>
                <option value="en-US-GuyNeural">en-US-GuyNeural (Standard Corporate Voice)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateTTS}
              disabled={ttsLoading || !customPrompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {ttsLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Voice & Extracting Forensics...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-slate-950" />
                  <span>Synthesize & Intercept AI Clone</span>
                </>
              )}
            </button>
          </div>

          {ttsError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{ttsError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Forensic Results Dashboard for Selected Sample / Synthesized Attack */}
      {activeResult && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-base font-bold text-white mb-1">
              Active Evaluation Forensic Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Live scientific explanation of detected vocal signatures.
            </p>
          </div>

          {/* Verdict Banner */}
          <div
            className={`rounded-2xl p-6 border transition-all ${
              activeResult.verdict === "synthetic"
                ? "glass-panel-danger border-rose-500/50 cyber-glow-red"
                : "glass-panel-safe border-emerald-500/50 cyber-glow-green"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeResult.verdict === "synthetic"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 pulse-alert"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}
                >
                  {activeResult.verdict === "synthetic" ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <ShieldCheck className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        activeResult.verdict === "synthetic"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {activeResult.verdict === "synthetic" ? "CRITICAL CLONE INTERCEPT" : "VERIFIED HUMAN"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Confidence: {(activeResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">
                    {activeResult.verdict === "synthetic"
                      ? "Synthetic AI Voice Clone Detected"
                      : "Authentic Human Voice Verified"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {activeResult.reason}
                  </p>
                </div>
              </div>

              {/* Risk Score */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800 min-w-[140px]">
                <span className="text-xs text-slate-400 font-mono uppercase">Risk Score</span>
                <span
                  className="text-4xl font-extrabold font-mono mt-1"
                  style={{ color: getRiskColor(activeResult.risk_score) }}
                >
                  {activeResult.risk_score.toFixed(1)}%
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-1">
                  {activeResult.risk_score < 35
                    ? "Safe"
                    : activeResult.risk_score <= 65
                    ? "Suspicious"
                    : "High Risk"}
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Acoustic Cards */}
          {activeResult.acoustic_features && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Pitch Variability</span>
                <div className="text-xl font-bold font-mono text-white">
                  {activeResult.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"} Hz
                </div>
                <p className="text-[11px] text-slate-400">
                  {activeResult.acoustic_features.pitch_variability_label}
                </p>
              </div>

              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Spectral Flatness</span>
                <div className="text-xl font-bold font-mono text-cyan-300">
                  {activeResult.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                </div>
                <p className="text-[11px] text-slate-400">
                  {Number(activeResult.acoustic_features.spectral_flatness) > 0.035
                    ? "High diffusion vocoder noise"
                    : "Organic formant peaks"}
                </p>
              </div>

              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Spectral Centroid</span>
                <div className="text-xl font-bold font-mono text-teal-300">
                  {activeResult.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"} Hz
                </div>
                <p className="text-[11px] text-slate-400">Frequency center of energy</p>
              </div>

              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Vocoder Artifact Index</span>
                <div
                  className="text-xl font-bold font-mono"
                  style={{
                    color: getRiskColor(activeResult.acoustic_features.neural_vocoder_artifact_score ?? 20),
                  }}
                >
                  {activeResult.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}/100
                </div>
                <p className="text-[11px] text-slate-400">Phase & deconv anomaly rating</p>
              </div>
            </div>
          )}

          {/* Interactive 2D Mel-Spectrogram Heatmap */}
          <SpectrogramViewer
            audioUrl={playingAudioUrl || undefined}
            duration={activeResult.audio_duration_sec}
            verdict={activeResult.verdict}
          />

          {/* Defense Mitigation Box */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-slate-300 space-y-1">
              <span className="text-slate-400 uppercase font-semibold">Recommended Mitigation Action:</span>
              <p className="text-slate-200">{activeResult.recommended_action}</p>
            </div>

            <Link
              href="/history"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5"
            >
              <span>View in Threat Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
