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
      setSiemUrl(data.siem_webhook_url || "");
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPresetTier = (tier: "strict" | "standard" | "permissive") => {
    setSecurityTier(tier);
    if (tier === "strict") {
      setLowThreshold(25.0);
      setHighThreshold(55.0);
      setMitigation("vocal_otp");
    } else if (tier === "standard") {
      setLowThreshold(35.0);
      setHighThreshold(65.0);
      setMitigation("vocal_otp");
    } else {
      setLowThreshold(45.0);
      setHighThreshold(75.0);
      setMitigation("log_only");
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
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
      setSaveMessage("Threat defense policy updated and propagated to ML scoring engine.");
      setTimeout(() => setSaveMessage(null), 4000);
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
    setWatermarkedBlobUrl(null);
    try {
      const blob = await embedAudioWatermark(embedFile, embedTag);
      const url = URL.createObjectURL(blob);
      setWatermarkedBlobUrl(url);
      setEmbedSuccess(true);
    } catch (err: any) {
      alert("Watermark embedding failed: " + err.message);
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
      const result = await verifyAudioWatermark(verifyFile);
      setVerifyResult(result);
    } catch (err: any) {
      setVerifyError(err.message || "Watermark verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>SECURITY ARCHITECTURE & DEFENSE POLICY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Security Policy & Acoustic Watermarking
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Tune ML detection sensitivity thresholds, default voice interception mitigations, and watermark provenance.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-[#F3EEFB] p-1.5 rounded-2xl border border-[#E3DCF0] shadow-sm">
          <button
            onClick={() => setActiveTab("policy")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "policy"
                ? "bg-[#B8A6E8] text-[#3A3450] shadow-xs"
                : "text-[#7A7390] hover:text-[#3A3450]"
            }`}
          >
            Triage Policies
          </button>
          <button
            onClick={() => setActiveTab("watermark")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "watermark"
                ? "bg-[#B8A6E8] text-[#3A3450] shadow-xs"
                : "text-[#7A7390] hover:text-[#3A3450]"
            }`}
          >
            Watermark Studio (Prevention)
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-2xl bg-[#DFF5E6] border border-[#2E9E5B] text-[#2E9E5B] text-xs font-bold flex items-center space-x-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {activeTab === "policy" ? (
        /* Tab 1: ML Threshold Tuning & Mitigations */
        <form onSubmit={handleSavePolicy} className="space-y-6">
          {/* Preset Security Tiers */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#8E79C9]" />
              <span>Risk Sensitivity Tiers</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleApplyPresetTier("strict")}
                className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
                  securityTier === "strict"
                    ? "bg-[#FCE4E4] border-[#D6395B]"
                    : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D6395B]">Strict Tier</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B] font-extrabold">
                    Zero-Trust
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7390] mt-2">
                  High &gt; 55%. Optimized for high-value financial transfers and executive line protection.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPresetTier("standard")}
                className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
                  securityTier === "standard"
                    ? "bg-[#F3EEFB] border-[#B8A6E8] shadow-md"
                    : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3A3450]">Standard Tier</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B] font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7390] mt-2">
                  Low &lt; 35%, High &gt; 65%. Balanced trade-off between false alarms and defense.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPresetTier("permissive")}
                className={`p-5 rounded-2xl border text-left transition-all shadow-xs ${
                  securityTier === "permissive"
                    ? "bg-[#EAF6F2] border-[#A7D8D0]"
                    : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3A3450]">Permissive Tier</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBF7F4] text-[#7A7390] border border-[#E3DCF0]">
                    Audit Only
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7390] mt-2">
                  High &gt; 75%. Prioritizes frictionless caller experience in noisy environments.
                </p>
              </button>
            </div>
          </div>

          {/* Granular Threshold Sliders */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#8E79C9]" />
              <span>Granular Detection Thresholds</span>
            </h3>

            {/* Low Risk Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#2E9E5B] font-bold">Low Risk Ceiling (Human Baseline):</span>
                <span className="text-[#3A3450] font-bold font-mono">{lowThreshold}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={lowThreshold}
                onChange={(e) => setLowThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#E3DCF0] rounded-lg appearance-none cursor-pointer accent-[#2E9E5B]"
              />
              <p className="text-[11px] text-[#7A7390]">
                Scores below this threshold are certified as Authentic Human without friction.
              </p>
            </div>

            {/* High Risk Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#D6395B] font-bold">High Risk Floor (Synthetic Alarm):</span>
                <span className="text-[#3A3450] font-bold font-mono">{highThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={90}
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#E3DCF0] rounded-lg appearance-none cursor-pointer accent-[#D6395B]"
              />
              <p className="text-[11px] text-[#7A7390]">
                Scores above this threshold immediately trigger the active mitigation defense.
              </p>
            </div>
          </div>

          {/* Automated Mitigation Enforcement Selection */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#8E79C9]" />
              <span>Default Action When High Threat is Triggered</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-xs ${
                  mitigation === "vocal_otp"
                    ? "bg-[#F3EEFB] border-[#B8A6E8] shadow-md"
                    : "bg-[#FBF7F4] border-[#E3DCF0]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mitigation"
                    checked={mitigation === "vocal_otp"}
                    onChange={() => setMitigation("vocal_otp")}
                    className="accent-[#B8A6E8]"
                  />
                  <span className="text-xs font-bold text-[#3A3450]">Dynamic Vocal OTP</span>
                </div>
                <p className="text-[11px] text-[#7A7390] mt-2">
                  Interrupts call with one-time randomized Vocal Challenge PIN.
                </p>
              </label>

              <label
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-xs ${
                  mitigation === "hangup"
                    ? "bg-[#FCE4E4] border-[#D6395B]"
                    : "bg-[#FBF7F4] border-[#E3DCF0]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mitigation"
                    checked={mitigation === "hangup"}
                    onChange={() => setMitigation("hangup")}
                    className="accent-[#D6395B]"
                  />
                  <span className="text-xs font-bold text-[#D6395B]">Immediate Disconnect</span>
                </div>
                <p className="text-[11px] text-[#7A7390] mt-2">
                  Instantly terminates connection and blacklists caller ID.
                </p>
              </label>

              <label
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-xs ${
                  mitigation === "log_only"
                    ? "bg-[#FDF3DA] border-[#C98A1F]"
                    : "bg-[#FBF7F4] border-[#E3DCF0]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mitigation"
                    checked={mitigation === "log_only"}
                    onChange={() => setMitigation("log_only")}
                    className="accent-[#C98A1F]"
                  />
                  <span className="text-xs font-bold text-[#C98A1F]">Silent SOC Telemetry</span>
                </div>
                <p className="text-[11px] text-[#7A7390] mt-2">
                  Alerts SOC team without alerting the attacker to gather evidence.
                </p>
              </label>
            </div>
          </div>

          {/* SIEM Webhook Integration */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-[#3A3450] uppercase font-mono tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#8E79C9]" />
              <span>Enterprise SIEM / Threat Desk Webhook URL</span>
            </h3>
            <input
              type="url"
              value={siemUrl}
              onChange={(e) => setSiemUrl(e.target.value)}
              placeholder="https://siem.internal/api/v1/voice-threats"
              className="w-full p-3 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs font-mono text-[#3A3450] focus:outline-none focus:border-[#B8A6E8]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Propagating Policies to Core Engine...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#3A3450]" />
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
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-5 shadow-sm">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-[10px] font-mono text-[#3A3450] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-[#3A3450]" />
                <span>SOURCE ATTACK PREVENTION</span>
              </div>
              <h2 className="text-base font-bold text-[#3A3450]">Embed Cryptographic Watermark</h2>
              <p className="text-xs text-[#7A7390] mt-1">
                Injects an inaudible ultrasonic spread-spectrum acoustic signature (14-15.5 kHz) into authorized executive audio before release.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => embedInputRef.current?.click()}
              className="border-2 border-dashed border-[#B8A6E8] hover:border-[#8E79C9] rounded-2xl p-6 text-center cursor-pointer bg-[#FBF7F4] hover:bg-[#EAF6F2] transition-all group shadow-xs"
            >
              <input
                type="file"
                ref={embedInputRef}
                accept=".wav,.mp3,.m4a,.flac"
                onChange={(e) => e.target.files && setEmbedFile(e.target.files[0])}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-[#8E79C9] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#3A3450]">
                {embedFile ? embedFile.name : "Select clean corporate audio file"}
              </p>
              <p className="text-[11px] text-[#7A7390] mt-1">Supports WAV, MP3, FLAC</p>
            </div>

            <div className="text-xs font-mono space-y-1">
              <label className="text-[#7A7390] font-semibold block">Corporate Cryptographic Tag:</label>
              <input
                type="text"
                value={embedTag}
                onChange={(e) => setEmbedTag(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-[#3A3450] text-xs focus:outline-none focus:border-[#B8A6E8]"
              />
            </div>

            <button
              onClick={handleEmbedWatermark}
              disabled={embedding || !embedFile}
              className="w-full py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
            >
              {embedding ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Synthesizing Spread-Spectrum Acoustic Watermark...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#3A3450]" />
                  <span>Inject Ultrasonic Provenance Watermark</span>
                </>
              )}
            </button>

            {embedSuccess && watermarkedBlobUrl && (
              <div className="p-4 rounded-2xl bg-[#DFF5E6] border border-[#2E9E5B] space-y-2 animate-fadeIn shadow-sm">
                <div className="flex items-center space-x-2 text-[#2E9E5B] text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Watermark embedded successfully! Imperceptible to human ear.</span>
                </div>
                <a
                  href={watermarkedBlobUrl}
                  download={`watermarked_${embedFile?.name || "audio.wav"}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2E9E5B] text-white text-xs font-bold shadow-xs hover:bg-[#26854d] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Protected Audio</span>
                </a>
              </div>
            )}
          </div>

          {/* Section B: Verify Audio Watermark */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-5 shadow-sm">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#A7D8D0]/40 border border-[#A7D8D0] text-[10px] font-mono text-[#3A3450] font-bold mb-1">
                <ShieldCheck className="w-3 h-3 text-[#3A3450]" />
                <span>INTEGRITY VERIFICATION</span>
              </div>
              <h2 className="text-base font-bold text-[#3A3450]">Verify Watermark Authenticity</h2>
              <p className="text-xs text-[#7A7390] mt-1">
                Scans an incoming voice recording to detect and decode any embedded corporate watermarks.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => verifyInputRef.current?.click()}
              className="border-2 border-dashed border-[#A7D8D0] hover:border-[#8FC9BF] rounded-2xl p-6 text-center cursor-pointer bg-[#FBF7F4] hover:bg-[#EAF6F2] transition-all group shadow-xs"
            >
              <input
                type="file"
                ref={verifyInputRef}
                accept=".wav,.mp3,.m4a,.flac"
                onChange={(e) => e.target.files && setVerifyFile(e.target.files[0])}
                className="hidden"
              />
              <FileAudio className="w-7 h-7 text-[#3a8b80] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#3A3450]">
                {verifyFile ? verifyFile.name : "Select suspect audio to scan for watermark"}
              </p>
              <p className="text-[11px] text-[#7A7390] mt-1">Supports WAV, MP3, FLAC</p>
            </div>

            <button
              onClick={handleVerifyWatermark}
              disabled={verifying || !verifyFile}
              className="w-full py-3 rounded-xl bg-[#A7D8D0] hover:bg-[#8FC9BF] text-[#3A3450] font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
            >
              {verifying ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Decoding High-Frequency Spectrum...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#3A3450]" />
                  <span>Scan for Corporate Watermark</span>
                </>
              )}
            </button>

            {verifyResult && (
              <div
                className={`p-4 rounded-2xl border space-y-2 animate-fadeIn shadow-sm ${
                  verifyResult.is_watermarked
                    ? "bg-[#DFF5E6] border-[#2E9E5B]"
                    : "bg-[#FCE4E4] border-[#D6395B]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {verifyResult.is_watermarked ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2E9E5B]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#D6395B]" />
                  )}
                  <span
                    className={`text-xs font-mono font-bold ${
                      verifyResult.is_watermarked ? "text-[#2E9E5B]" : "text-[#D6395B]"
                    }`}
                  >
                    {verifyResult.is_watermarked
                      ? "PROVENANCE VERIFIED: Corporate Watermark Present"
                      : "NO WATERMARK DETECTED: Untrusted External Audio"}
                  </span>
                </div>

                <div className="text-xs font-mono text-[#3A3450] space-y-1 pt-1">
                  <div>Status: {verifyResult.signature_status}</div>
                  {verifyResult.explanation && (
                    <div className="text-[#7c63c7] font-bold">
                      {verifyResult.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
