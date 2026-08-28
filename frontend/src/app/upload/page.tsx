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
    if (score < 35) return "#10b981"; // Emerald green
    if (score <= 65) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose red
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span>DEEP AUDIO FORENSIC INSPECTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Audio File Inspector
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload voice recordings for sliding-window acoustic forensics, vocoder artifact analysis, and threat verdict.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/history"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-2"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
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
          className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/70 rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-cyan-950/20 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept=".wav,.mp3,.m4a,.flac,.ogg"
            className="hidden"
          />
          <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
            Drop your audio file here, or <span className="text-cyan-400 underline">browse</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Supports <span className="text-slate-300 font-mono font-medium">WAV, MP3, M4A, FLAC, OGG</span> (up to 25MB)
          </p>
          <div className="mt-6 flex items-center justify-center space-x-6 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Layer Forensics</span>
            </span>
            <span className="flex items-center space-x-1">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sliding Window Chunks</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit Logged in SQLite</span>
            </span>
          </div>
        </div>
      ) : (
        /* Audio Player & Analysis Controls */
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <FileAudio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "Audio File"}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Another File</span>
            </button>
          </div>

          {/* Interactive Player Controls */}
          {audioUrl && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
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
                  className="w-11 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-cyan-500/30"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
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
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Extracting Acoustic Forensics...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
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
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Forensic Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Verdict Banner */}
          <div
            className={`rounded-2xl p-6 border transition-all duration-500 ${
              result.verdict === "synthetic"
                ? "glass-panel-danger border-rose-500/50 cyber-glow-red"
                : "glass-panel-safe border-emerald-500/50 cyber-glow-green"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    result.verdict === "synthetic"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 pulse-alert"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
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
                      className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        result.verdict === "synthetic"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {result.verdict === "synthetic" ? "CRITICAL THREAT" : "VERIFIED HUMAN"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-white">
                    {result.verdict === "synthetic"
                      ? "Synthetic AI Voice Clone Detected"
                      : "Authentic Human Voice Verified"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {result.reason}
                  </p>
                </div>
              </div>

              {/* Risk Score Meter Badge */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800 min-w-[150px]">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  Risk Score
                </span>
                <span
                  className="text-4xl font-extrabold font-mono mt-1"
                  style={{ color: getRiskColor(result.risk_score) }}
                >
                  {result.risk_score.toFixed(1)}
                  <span className="text-sm text-slate-500 font-normal">/100</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-1">
                  {result.risk_score < 35
                    ? "Low (Human)"
                    : result.risk_score <= 65
                    ? "Suspicious"
                    : "High (Synthetic)"}
                </span>
              </div>
            </div>
          </div>

          {/* Temporal Sliding Chunk Chart (Recharts) */}
          {result.chunk_scores && result.chunk_scores.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Temporal Sliding-Window Risk Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sliding window risk score across audio duration. Red peaks identify synthetic voice anomalies.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">&lt;35% Safe</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-slate-400">&gt;65% Clone</span>
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
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#090d16",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [`${value}%`, "Risk Score"]}
                    />
                    <ReferenceLine y={65} stroke="#f43f5e" strokeDasharray="3 3" />
                    <ReferenceLine y={35} stroke="#10b981" strokeDasharray="3 3" />
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
              <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Pitch Dynamics ($F_0$)
                </span>
                <div className="text-2xl font-bold font-mono text-white">
                  {result.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"}{" "}
                  <span className="text-xs text-slate-400 font-normal">Hz std dev</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {result.acoustic_features.pitch_variability_label}
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Natural human speech exhibits dynamic inflection (&gt;20 Hz). AI clones often exhibit rigid robotic pitch contours.
                </p>
              </div>

              {/* Spectral Flatness (Wiener Entropy) */}
              <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Spectral Flatness
                </span>
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {result.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {Number(result.acoustic_features.spectral_flatness) > 0.035
                    ? "⚠️ Elevated Vocoder Noise Floor"
                    : "✅ Natural Harmonic Resonances"}
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Neural vocoders produce uniform noise distributions in high frequency bins, raising Wiener entropy.
                </p>
              </div>

              {/* Spectral Centroid */}
              <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Spectral Centroid
                </span>
                <div className="text-2xl font-bold font-mono text-teal-300">
                  {result.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"}{" "}
                  <span className="text-xs text-slate-400 font-normal">Hz</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Energy distribution center of mass
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Measures frequency weighting. Neural TTS typically lacks natural high-frequency harmonic decay.
                </p>
              </div>

              {/* Neural Vocoder Artifact Score */}
              <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Vocoder Artifact Index
                </span>
                <div
                  className="text-2xl font-bold font-mono"
                  style={{
                    color: getRiskColor(result.acoustic_features.neural_vocoder_artifact_score ?? 20),
                  }}
                >
                  {result.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}{" "}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {Number(result.acoustic_features.neural_vocoder_artifact_score) > 60
                    ? "🚨 Severe Neural Synthesis Markers"
                    : "✅ Organic Waveform Dynamics"}
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Aggregate index of phase discontinuities and deconvolutional artifacts characteristic of HiFi-GAN.
                </p>
              </div>
            </div>
          )}

          {/* Actionable Enterprise Defense & Mitigation Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Recommended Security Response</h3>
                <p className="text-xs text-slate-400">
                  Automated threat policy recommendations based on voice impersonation risk tier.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
              {result.recommended_action}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <span>Scan ID:</span>
                <span className="text-slate-200 select-all">{result.test_id}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/history"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700 flex items-center space-x-1.5"
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
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors flex items-center space-x-1.5"
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
