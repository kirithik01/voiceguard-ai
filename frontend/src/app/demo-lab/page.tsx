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
      const result = await runDemoSample(sample.id);
      setActiveResult(result);
      // Auto-preview audio
      const audioUrl = getSampleAudioUrl(sample.id);
      playAudio(audioUrl);
    } catch (err: any) {
      alert("Failed to evaluate demo sample: " + (err.message || "Unknown error"));
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
      const res = await generateCustomTTS(customPrompt, selectedVoice);
      setActiveResult(res.result);
      if (res.audio_url) {
        playAudio(`http://127.0.0.1:8001${res.audio_url}`);
      }
    } catch (err: any) {
      setTtsError(err.message || "Failed to synthesize neural audio clone.");
    } finally {
      setTtsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 35) return "#2E9E5B";
    if (score <= 65) return "#C98A1F";
    return "#D6395B";
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudioUrl(null)}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Zap className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>HACKATHON JURY BENCHMARK TESTBED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Judge Demo Lab & Synthetic Voice Sandbox
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Preloaded side-by-side human vs synthetic attack vectors plus a real-time zero-day AI clone synthesizer.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/history"
            className="px-4 py-2 rounded-xl bg-[#F3EEFB] border border-[#E3DCF0] hover:border-[#B8A6E8] text-xs font-semibold text-[#3A3450] transition-all flex items-center space-x-2 shadow-sm"
          >
            <Activity className="w-4 h-4 text-[#8E79C9]" />
            <span>Threat Logs</span>
          </Link>
        </div>
      </div>

      {/* Section 1: Pre-Packaged Attack Vectors (1-Click Testbed) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#3A3450] flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#C98A1F]" />
              <span>Preloaded Scenarios (1-Click Instant Evaluation)</span>
            </h2>
            <p className="text-xs text-[#7A7390]">
              Select any pre-configured voice vector to hear playback and observe instant forensic classification.
            </p>
          </div>

          <button
            onClick={fetchSamples}
            className="p-2 rounded-xl bg-[#F3EEFB] hover:bg-[#EAF6F2] text-[#7A7390] hover:text-[#3A3450] border border-[#E3DCF0] transition-colors"
            title="Reload Scenarios"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSamples ? "animate-spin text-[#8E79C9]" : ""}`} />
          </button>
        </div>

        {loadingSamples ? (
          <div className="p-8 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] text-center shadow-sm">
            <Activity className="w-6 h-6 animate-spin text-[#8E79C9] mx-auto mb-2" />
            <span className="text-xs text-[#7A7390]">Loading attack scenario catalog...</span>
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
                  className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm ${
                    isSynthetic
                      ? "bg-[#FCE4E4]/40 border-[#D6395B]/40 hover:border-[#D6395B]"
                      : "bg-[#DFF5E6]/40 border-[#2E9E5B]/40 hover:border-[#2E9E5B]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isSynthetic
                            ? "bg-[#FCE4E4] text-[#D6395B] border-[#D6395B]"
                            : "bg-[#DFF5E6] text-[#2E9E5B] border-[#2E9E5B]"
                        }`}
                      >
                        {sample.threat_level} • {sample.category}
                      </span>
                      <span className="text-xs font-mono text-[#7A7390]">
                        {sample.duration_sec}s
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#3A3450]">{sample.title}</h3>
                      <p className="text-xs text-[#7A7390] mt-1 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 space-y-3">
                    {/* Audio Playback Toggle */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playAudio(audioUrl)}
                        className="px-3 py-1.5 rounded-xl bg-[#FBF7F4] hover:bg-[#EAF6F2] text-xs text-[#3A3450] border border-[#E3DCF0] flex items-center space-x-1.5 transition-colors font-medium shadow-xs"
                      >
                        {isPlayingThis ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-[#8E79C9]" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-[#8E79C9]" />
                            <span>Preview Audio</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Run Forensic Evaluation Button */}
                    <button
                      onClick={() => handleRunSample(sample)}
                      disabled={isRunningThis}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 ${
                        isSynthetic
                          ? "bg-[#D6395B] hover:bg-[#bf2e4e] text-white"
                          : "bg-[#2E9E5B] hover:bg-[#26854d] text-white"
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
      <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#B8A6E8]/30 border border-[#B8A6E8] flex items-center justify-center text-[#3A3450] shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#3A3450] flex items-center space-x-2">
              <span>Live AI Voice Clone Synthesizer (Judge Custom Attack Sandbox)</span>
            </h2>
            <p className="text-xs text-[#7A7390]">
              Type any prompt to generate a synthetic neural voice clone with Edge-TTS and witness VoiceGuard intercept it.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-[#3A3450] font-semibold block mb-1">
              Attacker Speech Prompt (What the AI Clone Speaks):
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter speech prompt..."
              className="w-full p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs text-[#3A3450] placeholder:text-[#7A7390] focus:outline-none focus:border-[#B8A6E8] font-mono leading-relaxed shadow-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-mono text-[#7A7390] font-semibold">Neural Model:</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-[#FBF7F4] border border-[#E3DCF0] rounded-xl px-3 py-1.5 text-xs text-[#3A3450] focus:outline-none focus:border-[#B8A6E8] font-mono font-medium shadow-xs"
              >
                <option value="en-US-ChristopherNeural">en-US-ChristopherNeural (Male Executive)</option>
                <option value="en-US-JennyNeural">en-US-JennyNeural (Female Financial Officer)</option>
                <option value="en-US-GuyNeural">en-US-GuyNeural (Standard Corporate Voice)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateTTS}
              disabled={ttsLoading || !customPrompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {ttsLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Synthesizing Voice & Extracting Forensics...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-[#3A3450]" />
                  <span>Synthesize & Intercept AI Clone</span>
                </>
              )}
            </button>
          </div>

          {ttsError && (
            <div className="p-3.5 rounded-2xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-xs font-bold flex items-center space-x-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{ttsError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Forensic Results Dashboard for Selected Sample / Synthesized Attack */}
      {activeResult && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-t border-[#E3DCF0] pt-6">
            <h3 className="text-base font-bold text-[#3A3450] mb-1">
              Active Evaluation Forensic Breakdown
            </h3>
            <p className="text-xs text-[#7A7390]">
              Live scientific explanation of detected vocal signatures.
            </p>
          </div>

          {/* Verdict Banner */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border-2 transition-all shadow-md ${
              activeResult.verdict === "synthetic"
                ? "bg-[#FCE4E4] border-[#D6395B]"
                : "bg-[#DFF5E6] border-[#2E9E5B]"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    activeResult.verdict === "synthetic"
                      ? "bg-[#D6395B] text-white pulse-alert"
                      : "bg-[#2E9E5B] text-white"
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
                      className={`text-xs font-mono font-extrabold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm ${
                        activeResult.verdict === "synthetic"
                          ? "bg-[#D6395B]"
                          : "bg-[#2E9E5B]"
                      }`}
                    >
                      {activeResult.verdict === "synthetic" ? "CRITICAL CLONE INTERCEPT" : "VERIFIED HUMAN"}
                    </span>
                    <span className="text-xs text-[#7A7390] font-mono font-semibold">
                      Confidence: {(activeResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3
                    className={`text-2xl font-black ${
                      activeResult.verdict === "synthetic" ? "text-[#D6395B]" : "text-[#2E9E5B]"
                    }`}
                  >
                    {activeResult.verdict === "synthetic"
                      ? "Synthetic AI Voice Clone Detected"
                      : "Authentic Human Voice Verified"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3A3450] leading-relaxed max-w-2xl font-medium">
                    {activeResult.reason}
                  </p>
                </div>
              </div>

              {/* Risk Score */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/90 border border-[#E3DCF0] min-w-[150px] shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">Risk Score</span>
                <span
                  className="text-4xl sm:text-5xl font-extrabold font-mono mt-1"
                  style={{ color: getRiskColor(activeResult.risk_score) }}
                >
                  {activeResult.risk_score.toFixed(1)}%
                </span>
                <span className="text-[11px] font-mono font-bold text-[#3A3450] mt-1">
                  {activeResult.risk_score < 35
                    ? "Safe (Human)"
                    : activeResult.risk_score <= 65
                    ? "Suspicious"
                    : "High Threat"}
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Acoustic Cards */}
          {activeResult.acoustic_features && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1.5 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">Pitch Variability</span>
                <div className="text-2xl font-bold font-mono text-[#3A3450]">
                  {activeResult.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"} Hz
                </div>
                <p className="text-[11px] text-[#7A7390]">
                  {activeResult.acoustic_features.pitch_variability_label}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1.5 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">Spectral Flatness</span>
                <div className="text-2xl font-bold font-mono text-[#7c63c7]">
                  {activeResult.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                </div>
                <p className="text-[11px] text-[#7A7390]">
                  {Number(activeResult.acoustic_features.spectral_flatness) > 0.035
                    ? "High diffusion vocoder noise"
                    : "Organic formant peaks"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1.5 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">Spectral Centroid</span>
                <div className="text-2xl font-bold font-mono text-[#3a8b80]">
                  {activeResult.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"} Hz
                </div>
                <p className="text-[11px] text-[#7A7390]">Frequency center of energy</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1.5 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">Vocoder Artifact Index</span>
                <div
                  className="text-2xl font-bold font-mono"
                  style={{
                    color: getRiskColor(activeResult.acoustic_features.neural_vocoder_artifact_score ?? 20),
                  }}
                >
                  {activeResult.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}/100
                </div>
                <p className="text-[11px] text-[#7A7390]">Phase & deconv anomaly rating</p>
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
          <div className="rounded-3xl bg-[#EAF6F2] p-5 border border-[#E3DCF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="text-xs font-mono text-[#3A3450] space-y-1">
              <span className="text-[#7A7390] uppercase font-bold">Recommended Mitigation Action:</span>
              <p className="font-semibold">{activeResult.recommended_action}</p>
            </div>

            <Link
              href="/history"
              className="px-4 py-2 rounded-xl bg-[#FBF7F4] hover:bg-[#E3DCF0] text-[#3A3450] border border-[#E3DCF0] text-xs font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 shadow-sm"
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
