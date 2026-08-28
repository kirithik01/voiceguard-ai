"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sliders,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Fingerprint,
  Radio,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  FileAudio
} from "lucide-react";
import {
  getSystemSettings,
  updateSystemSettings,
  embedAudioWatermark,
  verifyAudioWatermark
} from "@/lib/api";
import { SystemSettings, WatermarkVerifyResponse } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form State
  const [securityTier, setSecurityTier] = useState<"strict" | "standard" | "permissive">("standard");
  const [lowThreshold, setLowThreshold] = useState<number>(35.0);
  const [highThreshold, setHighThreshold] = useState<number>(65.0);
  const [mitigation, setMitigation] = useState<"vocal_otp" | "hangup" | "log_only">("vocal_otp");
  const [siemUrl, setSiemUrl] = useState<string>("");

  // Watermark Studio State
  const [activeTab, setActiveTab] = useState<"policy" | "watermark">("policy");

  // Embed Watermark state
  const [embedFile, setEmbedFile] = useState<File | null>(null);
  const [embedTag, setEmbedTag] = useState<string>("VOICEGUARD_ENTERPRISE_AUTHENTIC_2026");
  const [embedding, setEmbedding] = useState<boolean>(false);
  const [watermarkedBlobUrl, setWatermarkedBlobUrl] = useState<string | null>(null);
  const [embedSuccess, setEmbedSuccess] = useState<boolean>(false);

  // Verify Watermark state
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<WatermarkVerifyResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const embedInputRef = useRef<HTMLInputElement | null>(null);
  const verifyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSystemSettings();
      setSettings(data);
      setSecurityTier(data.security_tier);
      setLowThreshold(data.low_risk_threshold);
      setHighThreshold(data.high_risk_threshold);
      setMitigation(data.auto_mitigation);
      setSiemUrl(data.siem_webhook_url);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelect = (tier: "strict" | "standard" | "permissive") => {
    setSecurityTier(tier);
    if (tier === "strict") {
      setLowThreshold(20.0);
      setHighThreshold(45.0);
    } else if (tier === "standard") {
      setLowThreshold(35.0);
      setHighThreshold(65.0);
    } else if (tier === "permissive") {
      setLowThreshold(45.0);
      setHighThreshold(75.0);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await updateSystemSettings({
        security_tier: securityTier,
        low_risk_threshold: lowThreshold,
        high_risk_threshold: highThreshold,
        auto_mitigation: mitigation,
        siem_webhook_url: siemUrl,
      });
      setSettings(updated);
      setSaveMessage("Enterprise policy and thresholds updated successfully across all nodes!");
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEmbedWatermark = async () => {
    if (!embedFile) return;
    setEmbedding(true);
    setEmbedSuccess(false);
    try {
      const blob = await embedAudioWatermark(embedFile, embedTag);
      const url = URL.createObjectURL(blob);
      setWatermarkedBlobUrl(url);
      setEmbedSuccess(true);
    } catch (err: any) {
      alert("Watermarking failed: " + err.message);
    } finally {
      setEmbedding(false);
    }
  };

  const handleVerifyWatermark = async () => {
    if (!verifyFile) return;
    setVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const res = await verifyAudioWatermark(verifyFile);
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyError(err.message || "Watermark verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE POLICY TUNING & ATTACK PREVENTION STUDIO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Policy & Acoustic Watermarking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure risk classification thresholds, automated mitigation triggers, and embed inaudible cryptographic watermarks for attack prevention.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("policy")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === "policy"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Security Policy</span>
          </button>

          <button
            onClick={() => setActiveTab("watermark")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === "watermark"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Watermarking Studio</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {activeTab === "policy" ? (
        /* Tab 1: Enterprise Security Policy */
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Security Posture Preset Tiers */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Operational Security Posture Presets</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strict Banking Tier */}
              <div
                onClick={() => handleTierSelect("strict")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  securityTier === "strict"
                    ? "glass-panel-danger border-rose-500/60 shadow-lg shadow-rose-500/10"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    STRICT BANKING
                  </span>
                  {securityTier === "strict" && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                </div>
                <h4 className="text-sm font-bold text-white">Wire Transfers & Executive MFA</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Aggressive sensitivity. Any subtle phase fluctuation flags for out-of-band verification.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Low: &lt;20%</span>
                  <span className="text-rose-400 font-bold">High: &gt;45%</span>
                </div>
              </div>

              {/* Standard Corporate Tier */}
              <div
                onClick={() => handleTierSelect("standard")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  securityTier === "standard"
                    ? "glass-panel border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    STANDARD CORPORATE
                  </span>
                  {securityTier === "standard" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <h4 className="text-sm font-bold text-white">Everyday Internal Operations</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Balanced defense matrix. Minimal false positives while arresting neural clones.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Low: &lt;35%</span>
                  <span className="text-cyan-400 font-bold">High: &gt;65%</span>
                </div>
              </div>

              {/* Permissive / High-Noise Tier */}
              <div
                onClick={() => handleTierSelect("permissive")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  securityTier === "permissive"
                    ? "glass-panel border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    HIGH-NOISE / CELL
                  </span>
                  {securityTier === "permissive" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <h4 className="text-sm font-bold text-white">Cellular & Low-Bandwidth Lines</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tolerates heavy codec compression artifacts and noisy acoustic environments.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Low: &lt;45%</span>
                  <span className="text-amber-400 font-bold">High: &gt;75%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Threshold Sliders */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Granular Risk Classification Thresholds</span>
            </h3>

            <div className="space-y-6">
              {/* Low Risk Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Safe / Genuine Human Threshold:</span>
                  <span className="text-emerald-400 font-bold">{lowThreshold.toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <p className="text-[11px] text-slate-500 font-mono">
                  Audio with risk score below this is categorized as Genuine Human without friction.
                </p>
              </div>

              {/* High Risk Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">High-Risk / Deepfake Intercept Threshold:</span>
                  <span className="text-rose-400 font-bold">{highThreshold.toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={85}
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <p className="text-[11px] text-slate-500 font-mono">
                  Audio with risk score at or above this triggers automated intercept mitigations.
                </p>
              </div>
            </div>
          </div>

          {/* Automated Mitigation Enforcement */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Automated Threat Mitigation Policy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  mitigation === "vocal_otp"
                    ? "bg-cyan-500/10 border-cyan-500/60"
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mitigation"
                    checked={mitigation === "vocal_otp"}
                    onChange={() => setMitigation("vocal_otp")}
                    className="accent-cyan-400"
                  />
                  <span className="text-xs font-bold text-white">Dynamic Vocal OTP</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Interrupts call with one-time randomized Vocal Challenge PIN.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  mitigation === "hangup"
                    ? "bg-rose-500/10 border-rose-500/60"
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mitigation"
                    checked={mitigation === "hangup"}
                    onChange={() => setMitigation("hangup")}
                    className="accent-rose-400"
                  />
                  <span className="text-xs font-bold text-white">Immediate Disconnect</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Instantly terminates connection and blacklists caller ID.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  mitigation === "log_only"
                    ? "bg-amber-500/10 border-amber-500/60"
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mitigation"
                    checked={mitigation === "log_only"}
                    onChange={() => setMitigation("log_only")}
                    className="accent-amber-400"
                  />
                  <span className="text-xs font-bold text-white">Silent SOC Telemetry</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Alerts SOC team without alerting the attacker to gather evidence.
                </p>
              </label>
            </div>
          </div>

          {/* SIEM Webhook Integration */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Enterprise SIEM / Threat Desk Webhook URL</span>
            </h3>
            <input
              type="url"
              value={siemUrl}
              onChange={(e) => setSiemUrl(e.target.value)}
              placeholder="https://siem.internal/api/v1/voice-threats"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Propagating Policies to Core Engine...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Save & Apply Enterprise Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Tab 2: Acoustic Watermarking Studio (Attack Prevention) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section A: Embed Inaudible Watermark */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 mb-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>SOURCE ATTACK PREVENTION</span>
              </div>
              <h2 className="text-base font-bold text-white">Embed Cryptographic Watermark</h2>
              <p className="text-xs text-slate-400 mt-1">
                Injects an inaudible ultrasonic spread-spectrum acoustic signature (14-15.5 kHz) into authorized executive audio before release.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => embedInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-6 text-center cursor-pointer bg-slate-900/40 transition-all group"
            >
              <input
                type="file"
                ref={embedInputRef}
                accept=".wav,.mp3,.m4a,.flac"
                onChange={(e) => e.target.files && setEmbedFile(e.target.files[0])}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">
                {embedFile ? embedFile.name : "Select clean corporate audio file"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Supports WAV, MP3, FLAC</p>
            </div>

            <div className="text-xs font-mono space-y-1">
              <label className="text-slate-400 block">Corporate Cryptographic Tag:</label>
              <input
                type="text"
                value={embedTag}
                onChange={(e) => setEmbedTag(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <button
              onClick={handleEmbedWatermark}
              disabled={embedding || !embedFile}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {embedding ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Ultrasonic Carrier Watermark...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Embed Inaudible Watermark</span>
                </>
              )}
            </button>

            {embedSuccess && watermarkedBlobUrl && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acoustic Watermark Embedded Successfully!</span>
                </div>
                <audio src={watermarkedBlobUrl} controls className="w-full h-8" />
                <a
                  href={watermarkedBlobUrl}
                  download={`watermarked_${embedFile?.name || "audio.wav"}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Watermarked Master</span>
                </a>
              </div>
            )}
          </div>

          {/* Section B: Verify Watermark Provenance */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>INBOUND PROVENANCE VERIFIER</span>
              </div>
              <h2 className="text-base font-bold text-white">Verify Corporate Provenance</h2>
              <p className="text-xs text-slate-400 mt-1">
                Inspects inbound audio streams for authentic enterprise watermarks to verify source legitimacy instantly.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => verifyInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/60 rounded-xl p-6 text-center cursor-pointer bg-slate-900/40 transition-all group"
            >
              <input
                type="file"
                ref={verifyInputRef}
                accept=".wav,.mp3,.m4a,.flac"
                onChange={(e) => e.target.files && setVerifyFile(e.target.files[0])}
                className="hidden"
              />
              <FileAudio className="w-7 h-7 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">
                {verifyFile ? verifyFile.name : "Select inbound audio to inspect"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Extracts high-frequency SNR</p>
            </div>

            {verifyError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {verifyError}
              </div>
            )}

            <button
              onClick={handleVerifyWatermark}
              disabled={verifying || !verifyFile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Demodulating Ultrasonic Frequencies...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Verify Watermark Authenticity</span>
                </>
              )}
            </button>

            {/* Verification Result Card */}
            {verifyResult && (
              <div
                className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
                  verifyResult.is_watermarked
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-amber-500/10 border-amber-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      verifyResult.is_watermarked
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {verifyResult.signature_status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: {(verifyResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {verifyResult.explanation}
                </p>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 truncate">
                  SHA-256: {verifyResult.sha256_hash}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
