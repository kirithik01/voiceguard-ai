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
    if (!enrollFile || !enrollName.trim()) {
      setEnrollError("Please provide speaker name and an organic voice reference audio file.");
      return;
    }
    setEnrolling(true);
    setEnrollError(null);
    try {
      const formData = new FormData();
      formData.append("name", enrollName);
      formData.append("role", enrollRole);
      formData.append("department", enrollDept);
      formData.append("file", enrollFile);
      await enrollSpeaker(formData);
      setShowEnrollModal(false);
      setEnrollName("");
      setEnrollRole("");
      setEnrollDept("");
      setEnrollFile(null);
      await fetchSpeakers();
    } catch (err: any) {
      setEnrollError(err.message || "Failed to enroll speaker profile.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteSpeaker = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete voiceprint profile for ${name}?`)) return;
    try {
      await deleteSpeaker(id);
      await fetchSpeakers();
      if (selectedSpeakerId === id) {
        setSelectedSpeakerId("");
      }
    } catch (err: any) {
      alert("Failed to delete speaker: " + err.message);
    }
  };

  const handleVerify = async () => {
    if (!selectedSpeakerId || !verifyFile) {
      setVerifyError("Please choose an enrolled executive and select an incoming call audio sample.");
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    setDualResult(null);
    try {
      const result = await verifySpeakerDualEngine(selectedSpeakerId, verifyFile);
      setDualResult(result);
    } catch (err: any) {
      setVerifyError(err.message || "Dual-engine verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Fingerprint className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>DUAL-ENGINE VOICE BIOMETRICS & LIVENESS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Speaker Voiceprint Profiles & Anti-Spoof Defense
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Combines acoustic voice identification with deep learning anti-spoofing to stop deepfaked executives.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Executive Profile</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Enrolled Profiles List & Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Speaker Voiceprints */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-[#8E79C9]" />
              <span>Enrolled Voiceprints ({speakers.length})</span>
            </h2>
          </div>

          {loadingSpeakers ? (
            <div className="rounded-3xl p-8 bg-[#F3EEFB] border border-[#E3DCF0] text-center shadow-sm">
              <Activity className="w-6 h-6 animate-spin text-[#8E79C9] mx-auto mb-2" />
              <span className="text-xs text-[#7A7390]">Loading biometric profiles...</span>
            </div>
          ) : speakers.length === 0 ? (
            <div className="rounded-3xl p-6 bg-[#F3EEFB] border border-[#E3DCF0] text-center space-y-3 shadow-sm">
              <Fingerprint className="w-10 h-10 text-[#7A7390] mx-auto" />
              <p className="text-xs text-[#7A7390]">No speaker voiceprints enrolled yet.</p>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#B8A6E8] text-[#3A3450] font-bold text-xs"
              >
                Enroll First Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {speakers.map((spk) => {
                const isSelected = selectedSpeakerId === spk.id;
                return (
                  <div
                    key={spk.id}
                    onClick={() => setSelectedSpeakerId(spk.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? "bg-[#F3EEFB] border-[#B8A6E8] shadow-md"
                        : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#3A3450]">{spk.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]">
                            Enrolled
                          </span>
                        </div>
                        <p className="text-xs text-[#7A7390]">
                          {spk.role || "Executive"} • {spk.department || "Corporate"}
                        </p>
                        <div className="text-[10px] font-mono text-[#7A7390] pt-1">
                          Enrolled: {new Date(spk.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSpeaker(spk.id, spk.name);
                        }}
                        className="p-1.5 rounded-lg text-[#7A7390] hover:text-[#D6395B] hover:bg-[#FCE4E4] transition-colors"
                        title="Delete voiceprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Dual-Engine Verification Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-5 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#B8A6E8]/30 border border-[#B8A6E8] flex items-center justify-center text-[#3A3450]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#3A3450]">
                  Dual-Engine Verification & Anti-Spoof Sandbox
                </h2>
                <p className="text-xs text-[#7A7390]">
                  Evaluates both acoustic voiceprint similarity AND anti-spoof liveness in a single unified pass.
                </p>
              </div>
            </div>

            {/* Target speaker selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#7A7390] font-semibold">Target Enrolled Profile to Verify Against:</label>
              <select
                value={selectedSpeakerId}
                onChange={(e) => setSelectedSpeakerId(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs font-mono text-[#3A3450] focus:outline-none focus:border-[#B8A6E8]"
              >
                {speakers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role} - {s.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Ingestion Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#B8A6E8] hover:border-[#8E79C9] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#FBF7F4] hover:bg-[#EAF6F2] group shadow-xs"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && setVerifyFile(e.target.files[0])}
                accept=".wav,.mp3,.m4a,.flac"
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-[#8E79C9] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#3A3450]">
                {verifyFile ? verifyFile.name : "Select or drop suspect voice recording to authenticate"}
              </p>
              <span className="text-[11px] text-[#7A7390] mt-1 block">
                Supports WAV, MP3, M4A, FLAC
              </span>
            </div>

            {verifyError && (
              <div className="p-3.5 rounded-2xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || !verifyFile || !selectedSpeakerId}
              className="w-full py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Computing Dual-Engine Biometrics & Liveness...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#3A3450]" />
                  <span>Execute Dual-Engine Authentication</span>
                </>
              )}
            </button>
          </div>

          {/* Dual Engine Results Display */}
          {dualResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Verdict Banner */}
              <div
                className={`rounded-3xl p-6 border-2 transition-all shadow-md ${
                  dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                    ? "bg-[#DFF5E6] border-[#2E9E5B]"
                    : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                    ? "bg-[#FCE4E4] border-[#D6395B]"
                    : "bg-[#FDF3DA] border-[#C98A1F]"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                        ? "bg-[#2E9E5B] text-white"
                        : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                        ? "bg-[#D6395B] text-white pulse-alert"
                        : "bg-[#C98A1F] text-white"
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
                      className={`text-xs font-mono font-extrabold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm ${
                        dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                          ? "bg-[#2E9E5B]"
                          : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                          ? "bg-[#D6395B]"
                          : "bg-[#C98A1F]"
                      }`}
                    >
                      {dualResult.dual_engine_final_verdict}
                    </span>

                    <h3
                      className={`text-xl font-black mt-1 ${
                        dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                          ? "text-[#2E9E5B]"
                          : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                          ? "text-[#D6395B]"
                          : "text-[#C98A1F]"
                      }`}
                    >
                      {dualResult.dual_engine_final_verdict === "AUTHORIZED_AUTHENTIC"
                        ? `Identity Verified: Authentic Voice of ${dualResult.speaker_name}`
                        : dualResult.dual_engine_final_verdict === "SPOOFED_CLONE"
                        ? `AI Clone Impersonating ${dualResult.speaker_name}`
                        : `Impostor Mismatch: Not ${dualResult.speaker_name}`}
                    </h3>

                    <p className="text-xs text-[#3A3450] leading-relaxed max-w-2xl font-medium">
                      {dualResult.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual-Gauges Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gauge 1: Anti-Spoof Liveness */}
                <div className="rounded-3xl p-5 bg-[#F3EEFB] border border-[#E3DCF0] space-y-2 shadow-sm">
                  <span className="text-xs font-mono text-[#7A7390] uppercase font-semibold">
                    Engine 1: Anti-Spoofing Liveness
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-3xl font-black font-mono"
                      style={{
                        color:
                          dualResult.liveness_risk_score < 35
                            ? "#2E9E5B"
                            : dualResult.liveness_risk_score <= 65
                            ? "#C98A1F"
                            : "#D6395B",
                      }}
                    >
                      {dualResult.liveness_risk_score.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        dualResult.liveness_verdict === "genuine"
                          ? "bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]"
                          : "bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]"
                      }`}
                    >
                      {dualResult.liveness_verdict.toUpperCase()} VOICE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7390] pt-2 border-t border-[#E3DCF0]">
                    Evaluates neural vocoder noise floor & pitch dynamic inflection.
                  </p>
                </div>

                {/* Gauge 2: Biometric Voiceprint Match */}
                <div className="rounded-3xl p-5 bg-[#F3EEFB] border border-[#E3DCF0] space-y-2 shadow-sm">
                  <span className="text-xs font-mono text-[#7A7390] uppercase font-semibold">
                    Engine 2: Speaker Voiceprint Match
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-3xl font-black font-mono"
                      style={{
                        color:
                          dualResult.biometric_similarity_pct >= 75
                            ? "#2E9E5B"
                            : dualResult.biometric_similarity_pct >= 60
                            ? "#C98A1F"
                            : "#D6395B",
                      }}
                    >
                      {dualResult.biometric_similarity_pct.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        dualResult.biometric_match_verdict === "MATCH_CONFIRMED"
                          ? "bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]"
                          : "bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]"
                      }`}
                    >
                      {dualResult.biometric_match_verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7390] pt-2 border-t border-[#E3DCF0]">
                    Acoustic formant resonance alignment with enrolled profile of {dualResult.speaker_name}.
                  </p>
                </div>
              </div>

              {/* Recommended Mitigation Action */}
              <div className="rounded-3xl p-5 bg-[#EAF6F2] border border-[#E3DCF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="text-xs font-mono text-[#3A3450] space-y-1">
                  <span className="text-[#7A7390] uppercase font-bold">Policy Recommendation:</span>
                  <p className="font-semibold">{dualResult.recommended_action}</p>
                </div>

                <Link
                  href="/history"
                  className="px-4 py-2 rounded-xl bg-[#FBF7F4] hover:bg-[#E3DCF0] text-[#3A3450] border border-[#E3DCF0] text-xs font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Audit Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F3EEFB] border border-[#E3DCF0] rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E3DCF0] pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#8E79C9]" />
                <h3 className="text-base font-bold text-[#3A3450]">Enroll Executive Voiceprint</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-[#7A7390] hover:text-[#3A3450] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#3A3450] font-semibold block mb-1">
                  Full Name / Identity:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satya Nadella"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs text-[#3A3450] placeholder:text-[#7A7390] focus:outline-none focus:border-[#B8A6E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#3A3450] font-semibold block mb-1">Role / Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Executive"
                    value={enrollRole}
                    onChange={(e) => setEnrollRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs text-[#3A3450] placeholder:text-[#7A7390] focus:outline-none focus:border-[#B8A6E8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#3A3450] font-semibold block mb-1">Department:</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive Board"
                    value={enrollDept}
                    onChange={(e) => setEnrollDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs text-[#3A3450] placeholder:text-[#7A7390] focus:outline-none focus:border-[#B8A6E8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#3A3450] font-semibold block mb-1">
                  Reference Organic Voice Audio (.wav / .mp3):
                </label>
                <input
                  type="file"
                  required
                  accept=".wav,.mp3,.m4a,.flac"
                  onChange={(e) => e.target.files && setEnrollFile(e.target.files[0])}
                  className="w-full text-xs text-[#7A7390] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#B8A6E8] file:text-[#3A3450] hover:file:bg-[#A792E0]"
                />
              </div>

              {enrollError && (
                <div className="p-3 rounded-xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-xs font-bold">
                  {enrollError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FBF7F4] hover:bg-[#EAF6F2] text-[#3A3450] text-xs font-semibold border border-[#E3DCF0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="px-5 py-2 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-sm transition-all"
                >
                  {enrolling ? "Extracting Acoustic Fingerprint..." : "Save Voiceprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
