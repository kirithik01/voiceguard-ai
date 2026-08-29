"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Activity,
  FileAudio,
  Lock,
  ArrowRight,
  Download,
  Fingerprint,
  Waves,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell
} from "recharts";
import { analyzeAudioFile } from "@/lib/api";
import { AnalyzeResult } from "@/lib/types";
import SpectrogramViewer from "@/components/SpectrogramViewer";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    // Check size limit (25MB)
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("File exceeds 25MB maximum limit.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Create preview URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeAudioFile(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze audio file. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setFile(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setIsPlaying(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getRiskColor = (score: number) => {
    if (score < 35) return "#2E9E5B"; // Saturated genuine green
    if (score <= 65) return "#C98A1F"; // Saturated amber
    return "#D6395B"; // Saturated synthetic crimson
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Fingerprint className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>DEEP AUDIO FORENSIC INSPECTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Audio File Inspector
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Upload voice recordings for sliding-window acoustic forensics, vocoder artifact analysis, and threat verdict.
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

      {/* Upload Zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-[#B8A6E8] hover:border-[#8E79C9] rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 bg-[#F3EEFB] hover:bg-[#EAF6F2] group shadow-sm"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept=".wav,.mp3,.m4a,.flac,.ogg"
            className="hidden"
          />
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#B8A6E8]/30 border border-[#B8A6E8] flex items-center justify-center text-[#3A3450] group-hover:scale-110 transition-all mb-4 shadow-sm">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#3A3450] group-hover:text-[#7c63c7] transition-colors">
            Drop your audio file here, or <span className="text-[#8E79C9] underline">browse</span>
          </h3>
          <p className="text-xs text-[#7A7390] mt-2">
            Supports <span className="text-[#3A3450] font-mono font-semibold">WAV, MP3, M4A, FLAC, OGG</span> (up to 25MB)
          </p>
          <div className="mt-6 flex items-center justify-center space-x-6 text-[11px] text-[#7A7390]">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
              <span>Multi-Layer Forensics</span>
            </span>
            <span className="flex items-center space-x-1">
              <Waves className="w-3.5 h-3.5 text-[#8E79C9]" />
              <span>Sliding Window Chunks</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-[#C98A1F]" />
              <span>Audit Logged in SQLite</span>
            </span>
          </div>
        </div>
      ) : (
        /* Audio Player & Analysis Controls */
        <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCF0]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8A6E8]/30 border border-[#B8A6E8] flex items-center justify-center text-[#3A3450]">
                <FileAudio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#3A3450] truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h4>
                <p className="text-xs text-[#7A7390] font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "Audio File"}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FBF7F4] hover:bg-[#EAF6F2] text-[#3A3450] transition-colors border border-[#E3DCF0] flex items-center space-x-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Another File</span>
            </button>
          </div>

          {/* Interactive Player Controls */}
          {audioUrl && (
            <div className="p-5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] space-y-4 shadow-sm">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] flex items-center justify-center transition-all shadow-sm"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs font-mono text-[#7A7390]">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-[#E3DCF0] rounded-lg appearance-none cursor-pointer accent-[#B8A6E8]"
                  />
                </div>
              </div>

              {/* Forensic 2D Spectrogram Heatmap */}
              <div className="pt-2">
                <SpectrogramViewer
                  audioBlob={file}
                  audioUrl={audioUrl}
                  currentTime={currentTime}
                  duration={duration}
                  verdict={result?.verdict}
                />
              </div>
            </div>
          )}

          {/* Scan Action CTA */}
          {!result && (
            <div className="flex justify-end pt-2">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                    <span>Extracting Acoustic Forensics...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#3A3450]" />
                    <span>Run Deep Forensic Analysis</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-sm font-semibold flex items-center space-x-3 shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Forensic Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Verdict Banner — Saturated Accents against Pastel Cards */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 shadow-md ${
              result.verdict === "synthetic"
                ? "bg-[#FCE4E4] border-[#D6395B]"
                : "bg-[#DFF5E6] border-[#2E9E5B]"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    result.verdict === "synthetic"
                      ? "bg-[#D6395B] text-white pulse-alert"
                      : "bg-[#2E9E5B] text-white"
                  }`}
                >
                  {result.verdict === "synthetic" ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <ShieldCheck className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-mono font-extrabold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm ${
                        result.verdict === "synthetic"
                          ? "bg-[#D6395B]"
                          : "bg-[#2E9E5B]"
                      }`}
                    >
                      {result.verdict === "synthetic" ? "🚨 CRITICAL THREAT" : "✅ VERIFIED HUMAN"}
                    </span>
                    <span className="text-xs text-[#7A7390] font-mono font-semibold">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h2
                    className={`text-2xl sm:text-3xl font-black ${
                      result.verdict === "synthetic" ? "text-[#D6395B]" : "text-[#2E9E5B]"
                    }`}
                  >
                    {result.verdict === "synthetic"
                      ? "Synthetic AI Voice Clone Detected"
                      : "Authentic Human Voice Verified"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3A3450] leading-relaxed max-w-2xl font-medium">
                    {result.reason}
                  </p>
                </div>
              </div>

              {/* Risk Score Meter Badge */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/90 border border-[#E3DCF0] min-w-[160px] shadow-sm">
                <span className="text-xs text-[#7A7390] uppercase font-mono tracking-wider font-semibold">
                  Risk Score
                </span>
                <span
                  className="text-4xl sm:text-5xl font-extrabold font-mono mt-1"
                  style={{ color: getRiskColor(result.risk_score) }}
                >
                  {result.risk_score.toFixed(1)}
                  <span className="text-sm text-[#7A7390] font-normal">/100</span>
                </span>
                <span className="text-xs font-mono font-bold mt-1 text-[#3A3450]">
                  {result.risk_score < 35
                    ? "Safe (Human)"
                    : result.risk_score <= 65
                    ? "Suspicious"
                    : "High Threat (Clone)"}
                </span>
              </div>
            </div>
          </div>

          {/* Temporal Sliding Chunk Chart (Recharts) */}
          {result.chunk_scores && result.chunk_scores.length > 0 && (
            <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#8E79C9]" />
                    <span>Temporal Sliding-Window Risk Timeline</span>
                  </h3>
                  <p className="text-xs text-[#7A7390]">
                    Sliding window risk score across audio duration. Crimson peaks identify synthetic voice anomalies.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E5B]" />
                    <span className="text-[#3A3450]">&lt;35% Safe</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D6395B]" />
                    <span className="text-[#3A3450]">&gt;65% Clone</span>
                  </span>
                </div>
              </div>

              <div className="h-60 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.chunk_scores.map((chunk) => ({
                      time: `${chunk.start_sec.toFixed(1)}s - ${chunk.end_sec.toFixed(1)}s`,
                      risk: chunk.risk_score,
                      label: chunk.label,
                      confidence: (chunk.confidence * 100).toFixed(0),
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="time"
                      stroke="#7A7390"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#7A7390"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#F3EEFB",
                        borderColor: "#E3DCF0",
                        borderRadius: "12px",
                        color: "#3A3450",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                      formatter={(value: any) => [`${value}%`, "Risk Score"]}
                    />
                    <ReferenceLine y={65} stroke="#D6395B" strokeDasharray="3 3" />
                    <ReferenceLine y={35} stroke="#2E9E5B" strokeDasharray="3 3" />
                    <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                      {result.chunk_scores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk_score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Acoustic Forensic Feature Breakdown Matrix */}
          {result.acoustic_features && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pitch Dynamics */}
              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-2 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">
                  Pitch Dynamics (F0)
                </span>
                <div className="text-2xl font-bold font-mono text-[#3A3450]">
                  {result.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"}{" "}
                  <span className="text-xs text-[#7A7390] font-normal">Hz std dev</span>
                </div>
                <div className="text-xs text-[#3A3450] font-semibold">
                  {result.acoustic_features.pitch_variability_label}
                </div>
                <p className="text-[11px] text-[#7A7390] pt-1 border-t border-[#E3DCF0]">
                  Natural human speech exhibits dynamic inflection (&gt;20 Hz). AI clones often exhibit rigid robotic pitch contours.
                </p>
              </div>

              {/* Spectral Flatness (Wiener Entropy) */}
              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-2 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">
                  Spectral Flatness
                </span>
                <div className="text-2xl font-bold font-mono text-[#7c63c7]">
                  {result.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                </div>
                <div className="text-xs text-[#3A3450] font-semibold">
                  {Number(result.acoustic_features.spectral_flatness) > 0.035
                    ? "⚠️ Elevated Vocoder Noise Floor"
                    : "✅ Natural Harmonic Resonances"}
                </div>
                <p className="text-[11px] text-[#7A7390] pt-1 border-t border-[#E3DCF0]">
                  Neural vocoders produce uniform noise distributions in high frequency bins, raising Wiener entropy.
                </p>
              </div>

              {/* Spectral Centroid */}
              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-2 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">
                  Spectral Centroid
                </span>
                <div className="text-2xl font-bold font-mono text-[#3a8b80]">
                  {result.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"}{" "}
                  <span className="text-xs text-[#7A7390] font-normal">Hz</span>
                </div>
                <div className="text-xs text-[#3A3450] font-semibold">
                  Energy distribution center of mass
                </div>
                <p className="text-[11px] text-[#7A7390] pt-1 border-t border-[#E3DCF0]">
                  Measures frequency weighting. Neural TTS typically lacks natural high-frequency harmonic decay.
                </p>
              </div>

              {/* Neural Vocoder Artifact Score */}
              <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-2 shadow-sm">
                <span className="text-xs text-[#7A7390] font-mono uppercase font-semibold">
                  Vocoder Artifact Index
                </span>
                <div
                  className="text-2xl font-bold font-mono"
                  style={{
                    color: getRiskColor(result.acoustic_features.neural_vocoder_artifact_score ?? 20),
                  }}
                >
                  {result.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}{" "}
                  <span className="text-xs text-[#7A7390] font-normal">/100</span>
                </div>
                <div className="text-xs text-[#3A3450] font-semibold">
                  {Number(result.acoustic_features.neural_vocoder_artifact_score) > 60
                    ? "🚨 Severe Synthesis Markers"
                    : "✅ Organic Waveform Dynamics"}
                </div>
                <p className="text-[11px] text-[#7A7390] pt-1 border-t border-[#E3DCF0]">
                  Aggregate index of phase discontinuities and deconvolutional artifacts characteristic of HiFi-GAN.
                </p>
              </div>
            </div>
          )}

          {/* Actionable Enterprise Defense & Mitigation Card */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-[#8E79C9]" />
              <div>
                <h3 className="text-base font-bold text-[#3A3450]">Recommended Security Response</h3>
                <p className="text-xs text-[#7A7390]">
                  Automated threat policy recommendations based on voice impersonation risk tier.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs sm:text-sm text-[#3A3450] leading-relaxed font-mono font-medium shadow-inner">
              {result.recommended_action}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-[#7A7390] font-mono">
                <span>Scan ID:</span>
                <span className="text-[#3A3450] font-bold select-all">{result.test_id}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/history"
                  className="px-4 py-2 rounded-xl bg-[#EAF6F2] hover:bg-[#d6eee6] text-xs font-semibold text-[#3A3450] transition-colors border border-[#E3DCF0] flex items-center space-x-1.5 shadow-sm"
                >
                  <span>View in Audit Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(result, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `forensic_report_${result.test_id.slice(0, 8)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Forensic JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
