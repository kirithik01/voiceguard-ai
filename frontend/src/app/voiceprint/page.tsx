"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Fingerprint,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Upload,
  UserPlus,
  Trash2,
  Activity,
  CheckCircle2,
  XCircle,
  FileAudio,
  ArrowRight,
  Sparkles,
  Lock,
  Layers
} from "lucide-react";
import {
  getEnrolledSpeakers,
  enrollSpeaker,
  deleteSpeaker,
  verifySpeakerDualEngine
} from "@/lib/api";
import { SpeakerProfile, DualEngineResult } from "@/lib/types";

export default function VoiceprintPage() {
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState<boolean>(true);

  // Enrollment Modal / Form state
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollName, setEnrollName] = useState<string>("");
  const [enrollRole, setEnrollRole] = useState<string>("");
  const [enrollDept, setEnrollDept] = useState<string>("");
  const [enrollFile, setEnrollFile] = useState<File | null>(null);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Verification state
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [dualResult, setDualResult] = useState<DualEngineResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoadingSpeakers(true);
    try {
      const data = await getEnrolledSpeakers();
      setSpeakers(data);
      if (data.length > 0 && !selectedSpeakerId) {
        setSelectedSpeakerId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load speakers:", err);
    } finally {
      setLoadingSpeakers(false);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName || !enrollRole || !enrollFile) {
      setEnrollError("Please provide name, role, and an audio sample.");
      return;
    }

    setEnrolling(true);
    setEnrollError(null);
    try {
      const formData = new FormData();
      formData.append("name", enrollName);
      formData.append("role", enrollRole);
      formData.append("department", enrollDept || "Corporate Executive");
      formData.append("file", enrollFile);

      const created = await enrollSpeaker(formData);
      setSpeakers((prev) => [...prev, created]);
      setSelectedSpeakerId(created.id);
      setShowEnrollModal(false);
      setEnrollName("");
      setEnrollRole("");
      setEnrollDept("");
      setEnrollFile(null);
    } catch (err: any) {
      setEnrollError(err.message || "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteSpeaker = async (id: string, name: string) => {
    if (!confirm(`Delete enrolled voiceprint for ${name}?`)) return;
    try {
      await deleteSpeaker(id);
      setSpeakers((prev) => prev.filter((s) => s.id !== id));
      if (selectedSpeakerId === id) {
        const remaining = speakers.filter((s) => s.id !== id);
        setSelectedSpeakerId(remaining.length > 0 ? remaining[0].id : "");
      }
      if (dualResult?.speaker_id === id) {
        setDualResult(null);
      }
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleVerifySubmit = async () => {
    if (!selectedSpeakerId) {
      setVerifyError("Please select an enrolled executive to verify against.");
      return;
    }
    if (!verifyFile) {
      setVerifyError("Please upload an audio file to evaluate.");
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setDualResult(null);
    try {
      const res = await verifySpeakerDualEngine(selectedSpeakerId, verifyFile);
      setDualResult(res);
    } catch (err: any) {
      setVerifyError(err.message || "Dual-engine verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span>DUAL-ENGINE DEFENSE: SPOOF LIVENESS + SPEAKER BIOMETRICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Voiceprint Biometrics & Identity Guard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enrolls authorized executive voiceprints and executes dual verification: deepfake liveness anti-spoofing + biometric acoustic voiceprint match.
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4 text-slate-950" />
          <span>Enroll New Voiceprint</span>
        </button>
      </div>

      {/* Grid: Enrolled Profiles List & Verification Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Executive Voiceprints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Enrolled Executives ({speakers.length})</span>
            </h2>
          </div>

          {loadingSpeakers ? (
            <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center">
              <Activity className="w-5 h-5 animate-spin text-cyan-400 mx-auto mb-2" />
              <span className="text-xs text-slate-400">Loading voiceprint profiles...</span>
            </div>
          ) : speakers.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center space-y-3">
              <Fingerprint className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No executive voiceprints enrolled yet.</p>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
              >
                Enroll First Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {speakers.map((spk) => {
                const isSelected = selectedSpeakerId === spk.id;
                return (
                  <div
                    key={spk.id}
                    onClick={() => setSelectedSpeakerId(spk.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "glass-panel border-cyan-500/60 shadow-md shadow-cyan-500/10"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                          {spk.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{spk.name}</h4>
                          <p className="text-[11px] text-cyan-300/80">{spk.role}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{spk.department}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSpeaker(spk.id, spk.name);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Baseline Pitch: {spk.baseline_pitch_hz ?? 170} Hz</span>
                      <span className="text-emerald-400/80">Active Bio-Key</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Dual-Engine Verification Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Dual-Engine Identity Verification Console</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload audio to simultaneously test for synthetic deepfake markers AND verify acoustic voiceprint match against the selected executive.
              </p>
            </div>

            {/* Selected Profile Indicator */}
            {selectedSpeakerId && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Executive for Verification:</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {speakers.find((s) => s.id === selectedSpeakerId)?.name} (
                  {speakers.find((s) => s.id === selectedSpeakerId)?.role})
                </span>
              </div>
            )}

            {/* Audio Dropzone for Verification */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-6 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/60 transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".wav,.mp3,.m4a,.flac,.ogg"
                onChange={(e) => e.target.files && setVerifyFile(e.target.files[0])}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">
                {verifyFile ? verifyFile.name : "Select or drop verification audio recording"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports WAV, MP3, M4A, FLAC up to 25MB
              </p>
            </div>

            {verifyError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleVerifySubmit}
              disabled={verifying || !verifyFile || !selectedSpeakerId}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Computing Dual-Engine Biometrics & Anti-Spoofing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Execute Dual-Engine Verification</span>
                </>
              )}
            </button>
          </div>

          {/* Dual-Engine Result Display */}
          {dualResult && (
            <div className="space-y-5 animate-fadeIn">
              {/* Verdict Header Banner */}
              <div
                className={`rounded-2xl p-6 border transition-all ${
                  dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                    ? "glass-panel-safe border-emerald-500/50 cyber-glow-green"
                    : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                    ? "glass-panel-danger border-rose-500/50 cyber-glow-red pulse-alert"
                    : "glass-panel border-amber-500/50"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE" ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <UserX className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {dualResult.dual_engine_final_verdict}
                    </span>

                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                        ? `Identity Verified: Authentic Voice of ${dualResult.speaker_name}`
                        : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                        ? `AI Clone Impersonating ${dualResult.speaker_name}`
                        : `Impostor Mismatch: Not ${dualResult.speaker_name}`}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {dualResult.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual-Gauges Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gauge 1: Anti-Spoof Liveness */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Engine 1: Anti-Spoofing Liveness
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-3xl font-extrabold font-mono"
                      style={{
                        color:
                          dualResult.liveness_risk_score < 35
                            ? "#10b981"
                            : dualResult.liveness_risk_score <= 65
                            ? "#f59e0b"
                            : "#f43f5e",
                      }}
                    >
                      {dualResult.liveness_risk_score.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        dualResult.liveness_verdict === "genuine"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {dualResult.liveness_verdict.toUpperCase()} VOICE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    Evaluates neural vocoder noise floor & pitch dynamic inflection.
                  </p>
                </div>

                {/* Gauge 2: Biometric Voiceprint Match */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Engine 2: Speaker Voiceprint Match
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-3xl font-extrabold font-mono"
                      style={{
                        color:
                          dualResult.biometric_similarity_pct >= 75
                            ? "#10b981"
                            : dualResult.biometric_similarity_pct >= 60
                            ? "#f59e0b"
                            : "#f43f5e",
                      }}
                    >
                      {dualResult.biometric_similarity_pct.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        dualResult.biometric_match_verdict === "MATCH_CONFIRMED"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {dualResult.biometric_match_verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    Acoustic formant resonance alignment with enrolled profile of {dualResult.speaker_name}.
                  </p>
                </div>
              </div>

              {/* Recommended Mitigation Action */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs font-mono space-y-1">
                  <span className="text-slate-400 uppercase font-semibold">
                    Enforced Security Action:
                  </span>
                  <p className="text-slate-200">{dualResult.recommended_action}</p>
                </div>

                <Link
                  href="/soc"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5"
                >
                  <span>SOC Incident Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Enroll Executive Voiceprint</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Executive Full Name:</label>
                <input
                  type="text"
                  required
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="e.g. Rajesh Verma"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Corporate Title / Role:</label>
                <input
                  type="text"
                  required
                  value={enrollRole}
                  onChange={(e) => setEnrollRole(e.target.value)}
                  placeholder="e.g. Chief Executive Officer"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Department / Branch:</label>
                <input
                  type="text"
                  value={enrollDept}
                  onChange={(e) => setEnrollDept(e.target.value)}
                  placeholder="e.g. Treasury & Executive Authorization"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Baseline Voice Audio Recording (.wav, .mp3):
                </label>
                <input
                  type="file"
                  required
                  accept=".wav,.mp3,.m4a,.flac"
                  onChange={(e) => e.target.files && setEnrollFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Provide 3-10 seconds of clear, authentic speech to extract vocal tract formant resonance baseline.
                </p>
              </div>

              {enrollError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                  {enrollError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center space-x-2"
                >
                  {enrolling && <Activity className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enroll Voiceprint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
