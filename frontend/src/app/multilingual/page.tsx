"use client";

import React, { useState, useEffect } from "react";
import {
  Languages,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Play,
  Volume2,
  Sparkles,
  Zap,
  CheckCircle2,
  FileAudio,
  Radio
} from "lucide-react";
import { getVernacularSamples, generateVernacularClone } from "@/lib/api";
import { VernacularSample, AnalyzeResult } from "@/lib/types";

export default function MultilingualPage() {
  const [samples, setSamples] = useState<VernacularSample[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<VernacularSample | null>(null);

  // Custom synthesizer state
  const [customText, setCustomText] = useState<string>(
    "नमस्ते, मैं साइबर सेल से बोल रहा हूँ। आपके बैंक खाते में संदिग्ध लेन-देन हुआ है।"
  );
  const [customLang, setCustomLang] = useState<string>("Hindi");
  const [customVoice, setCustomVoice] = useState<string>("hi-IN-MadhurNeural");

  // Analysis result
  const [activeAnalysis, setActiveAnalysis] = useState<AnalyzeResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await getVernacularSamples();
      setSamples(data);
      if (data.length > 0) setSelectedSample(data[0]);
    } catch (err) {
      console.error("Failed to load vernacular samples:", err);
    }
  };

  const handleTestPreset = async (s: VernacularSample) => {
    setLoading(true);
    setSelectedSample(s);
    setActiveAnalysis(null);
    setAudioUrl(null);

    try {
      const res = await generateVernacularClone(s.text, s.language, s.voice);
      setActiveAnalysis(res.result);
      setAudioUrl(`http://127.0.0.1:8001${res.audio_url}`);
    } catch (err: any) {
      alert("Vernacular test failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustom = async () => {
    if (!customText.trim()) return;
    setLoading(true);
    setActiveAnalysis(null);
    setAudioUrl(null);

    try {
      const res = await generateVernacularClone(customText, customLang, customVoice);
      setActiveAnalysis(res.result);
      setAudioUrl(`http://127.0.0.1:8001${res.audio_url}`);
    } catch (err: any) {
      alert("Synthesis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>INDIAN REGIONAL VERNACULAR ACOUSTIC DEFENSE CORE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Lingual Vernacular Defense Lab
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirically proving that VoiceGuard is <span className="text-cyan-300 font-bold">100% language-agnostic</span>: neural vocoder mathematics and biological pitch physics detect synthetic clones across Hindi, Tamil, Telugu, and Hinglish with zero vocabulary dependency.
          </p>
        </div>
      </div>

      {/* Physics Explainer Card */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 bg-cyan-950/10 text-xs text-slate-300 leading-relaxed space-y-1">
        <span className="font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Why VoiceGuard Works Universally Across Indian Languages</span>
        </span>
        <p>
          Unlike NLP models that require training per language dialect, VoiceGuard analyzes the raw acoustic waveform. Whether speech is in Hindi, Tamil, or Bengali, human phonation requires natural vocal fold vibration ($F_0$ pitch std dev &gt; 15 Hz). Synthetic neural vocoders inevitably produce flat monotone intonation and elevated STFT Wiener flatness, making clone detection invariant to regional accents.
        </p>
      </div>

      {/* 1-Click Regional Attack Presets */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Radio className="w-4 h-4 text-rose-400" />
          <span>Select Real-World Indian Regional Attack Vector</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => handleTestPreset(s)}
              disabled={loading}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                selectedSample?.id === s.id
                  ? "glass-panel-danger border-rose-500/60 shadow-md shadow-rose-500/10"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {s.language}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{s.target_sector}</span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{s.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                &ldquo;{s.text}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Vernacular Voice Synthesizer */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Interactive Regional Voice Clone Synthesizer</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-slate-400">
              Input Speech in Any Indian Script (Devanagari, Tamil, Telugu, or Hinglish):
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Enter text to synthesize and evaluate..."
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Target Language:</label>
              <select
                value={customLang}
                onChange={(e) => {
                  setCustomLang(e.target.value);
                  if (e.target.value === "Hindi") setCustomVoice("hi-IN-MadhurNeural");
                  else if (e.target.value === "Tamil") setCustomVoice("ta-IN-ValluvarNeural");
                  else if (e.target.value === "Telugu") setCustomVoice("te-IN-MohanNeural");
                  else setCustomVoice("hi-IN-MadhurNeural");
                }}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hinglish">Hinglish (Code-Switching)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateCustom}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Regional Voice & Scoring...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950" />
                  <span>Synthesize & Analyze Vernacular Clone</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Result Banner & Playback */}
      {activeAnalysis && (
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  activeAnalysis.verdict === "synthetic"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {activeAnalysis.verdict === "synthetic" ? "CRITICAL SYNTHETIC CLONE" : "GENUINE SPEECH"}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {activeAnalysis.filename_or_label}
              </h3>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-slate-400 uppercase">Acoustic Risk Rating</div>
              <div
                className="text-3xl font-extrabold font-mono"
                style={{
                  color:
                    activeAnalysis.risk_score < 35
                      ? "#10b981"
                      : activeAnalysis.risk_score <= 65
                      ? "#f59e0b"
                      : "#f43f5e",
                }}
              >
                {activeAnalysis.risk_score.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-3">
              <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
          )}

          {/* Forensic Acoustic Signatures */}
          {activeAnalysis.acoustic_features && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Pitch Dynamics (F0)</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {activeAnalysis.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"} Hz
                </div>
                <span className="text-[9px] text-rose-400">Flat synthetic baseline</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Wiener Flatness</span>
                <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                  {activeAnalysis.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                </div>
                <span className="text-[9px] text-cyan-400">Diffusion noise floor</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Spectral Centroid</span>
                <div className="text-sm font-bold font-mono text-teal-300 mt-0.5">
                  {activeAnalysis.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"} Hz
                </div>
                <span className="text-[9px] text-slate-500">Formant center</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Vocoder Anomaly</span>
                <div className="text-sm font-bold font-mono text-rose-300 mt-0.5">
                  {activeAnalysis.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}/100
                </div>
                <span className="text-[9px] text-rose-400">Deconv artifacts</span>
              </div>
            </div>
          )}

          <p className="text-xs font-mono text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
            <span className="text-cyan-400 font-bold">Detection Rationale: </span>
            {activeAnalysis.reason}
          </p>
        </div>
      )}
    </div>
  );
}
