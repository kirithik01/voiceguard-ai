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
      alert("Failed to synthesize vernacular sample: " + err.message);
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
      alert("Vernacular generation failed: " + err.message);
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
            <Languages className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>REGIONAL INDIAN LANGUAGE & CODE-SWITCHING DEFENSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Multi-Lingual Vernacular Threat Defense Lab
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Validates detection robustness against regional Indian language synthetic clones (Hindi, Tamil, Telugu, Hinglish).
          </p>
        </div>
      </div>

      {/* Preset Regional Scenarios Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#C98A1F]" />
          <span>Pre-Staged Regional Attack Vectors</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => handleTestPreset(s)}
              disabled={loading}
              className={`p-5 rounded-3xl border text-left transition-all space-y-2 shadow-xs hover:-translate-y-0.5 ${
                selectedSample?.id === s.id
                  ? "bg-[#FCE4E4] border-2 border-[#D6395B]"
                  : "bg-[#F3EEFB] border-[#E3DCF0] hover:border-[#B8A6E8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]">
                  {s.language}
                </span>
                <span className="text-[10px] font-mono text-[#7A7390] font-semibold">{s.target_sector}</span>
              </div>
              <h4 className="text-xs font-bold text-[#3A3450] line-clamp-1">{s.title}</h4>
              <p className="text-[11px] text-[#7A7390] line-clamp-2 italic">
                &ldquo;{s.text}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Vernacular Voice Synthesizer */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#8E79C9]" />
          <span>Interactive Regional Voice Clone Synthesizer</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-[#7A7390] font-semibold">
              Input Speech in Any Indian Script (Devanagari, Tamil, Telugu, or Hinglish):
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs text-[#3A3450] focus:border-[#B8A6E8] focus:outline-none transition-colors font-mono leading-relaxed shadow-xs"
              placeholder="Enter text to synthesize and evaluate..."
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-[#7A7390] font-semibold block mb-1">Target Language:</label>
              <select
                value={customLang}
                onChange={(e) => {
                  setCustomLang(e.target.value);
                  if (e.target.value === "Hindi") setCustomVoice("hi-IN-MadhurNeural");
                  else if (e.target.value === "Tamil") setCustomVoice("ta-IN-ValluvarNeural");
                  else if (e.target.value === "Telugu") setCustomVoice("te-IN-MohanNeural");
                  else setCustomVoice("hi-IN-MadhurNeural");
                }}
                className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs font-mono text-[#3A3450] focus:outline-none focus:border-[#B8A6E8] shadow-xs"
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
              className="w-full py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Synthesizing Regional Voice & Scoring...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#3A3450]" />
                  <span>Synthesize & Analyze Vernacular Clone</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Result Banner & Playback */}
      {activeAnalysis && (
        <div
          className={`rounded-3xl p-6 sm:p-7 border-2 space-y-6 animate-fadeIn shadow-md ${
            activeAnalysis.verdict === "synthetic"
              ? "bg-[#FCE4E4] border-[#D6395B]"
              : "bg-[#DFF5E6] border-[#2E9E5B]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-4">
            <div>
              <span
                className={`text-[10px] font-mono font-extrabold px-3 py-1 rounded-full text-white shadow-sm ${
                  activeAnalysis.verdict === "synthetic"
                    ? "bg-[#D6395B]"
                    : "bg-[#2E9E5B]"
                }`}
              >
                {activeAnalysis.verdict === "synthetic" ? "CRITICAL SYNTHETIC CLONE" : "GENUINE SPEECH"}
              </span>
              <h3 className="text-xl font-black text-[#3A3450] mt-2">
                {activeAnalysis.filename_or_label}
              </h3>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#7A7390] uppercase font-semibold">Acoustic Risk Rating</div>
              <div
                className="text-4xl font-black font-mono mt-0.5"
                style={{
                  color:
                    activeAnalysis.risk_score < 35
                      ? "#2E9E5B"
                      : activeAnalysis.risk_score <= 65
                      ? "#C98A1F"
                      : "#D6395B",
                }}
              >
                {activeAnalysis.risk_score.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="p-4 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] flex items-center space-x-3 shadow-xs">
              <Volume2 className="w-5 h-5 text-[#8E79C9] shrink-0" />
              <audio controls src={audioUrl} className="w-full h-8 accent-[#B8A6E8]" />
            </div>
          )}

          {/* Forensic Acoustic Signatures */}
          {activeAnalysis.acoustic_features && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] shadow-xs">
                <span className="text-[10px] text-[#7A7390] font-mono font-semibold">Pitch Dynamics (F0)</span>
                <div className="text-base font-bold font-mono text-[#3A3450] mt-0.5">
                  {activeAnalysis.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"} Hz
                </div>
                <span className="text-[9px] text-[#D6395B] font-semibold">Flat synthetic baseline</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] shadow-xs">
                <span className="text-[10px] text-[#7A7390] font-mono font-semibold">Wiener Flatness</span>
                <div className="text-base font-bold font-mono text-[#7c63c7] mt-0.5">
                  {activeAnalysis.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                </div>
                <span className="text-[9px] text-[#7c63c7] font-semibold">Diffusion noise floor</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] shadow-xs">
                <span className="text-[10px] text-[#7A7390] font-mono font-semibold">Spectral Centroid</span>
                <div className="text-base font-bold font-mono text-[#3a8b80] mt-0.5">
                  {activeAnalysis.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"} Hz
                </div>
                <span className="text-[9px] text-[#7A7390]">Formant center</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] shadow-xs">
                <span className="text-[10px] text-[#7A7390] font-mono font-semibold">Vocoder Anomaly</span>
                <div className="text-base font-bold font-mono text-[#D6395B] mt-0.5">
                  {activeAnalysis.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}/100
                </div>
                <span className="text-[9px] text-[#D6395B] font-semibold">Deconv artifacts</span>
              </div>
            </div>
          )}

          <p className="text-xs font-mono text-[#3A3450] leading-relaxed border-t border-[#E3DCF0] pt-3 font-medium">
            <span className="text-[#7c63c7] font-bold">Detection Rationale: </span>
            {activeAnalysis.reason}
          </p>
        </div>
      )}
    </div>
  );
}
