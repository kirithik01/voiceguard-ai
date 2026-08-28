"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Download,
  RotateCcw,
  ChevronRight,
  X,
  FileAudio,
  Activity,
  ArrowUpDown,
  Radio,
  Upload,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  FileText,
  Printer,
  Scale
} from "lucide-react";
import { getTestHistory, deleteTestById, clearHistory, getTestById, getLegalDossier } from "@/lib/api";
import { HistoryItem, AnalyzeResult, LegalDossierData } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detailed modal inspect
  const [selectedScan, setSelectedScan] = useState<AnalyzeResult | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Legal Case Dossier state
  const [dossierData, setDossierData] = useState<LegalDossierData | null>(null);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);

  const handleOpenDossier = async (scanId: string) => {
    setDossierLoading(true);
    try {
      const data = await getLegalDossier(scanId);
      setDossierData(data);
    } catch (err: any) {
      alert("Failed to load legal dossier: " + err.message);
    } finally {
      setDossierLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTestHistory(verdictFilter);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch threat history logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [verdictFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan record from threat logs?")) return;
    try {
      await deleteTestById(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedScan?.test_id === id) {
        setSelectedScan(null);
      }
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear ALL threat audit logs? This cannot be undone.")) return;
    try {
      await clearHistory();
      setHistory([]);
      setSelectedScan(null);
    } catch (err: any) {
      alert("Failed to clear logs: " + err.message);
    }
  };

  const handleInspect = async (item: HistoryItem) => {
    setModalLoading(true);
    try {
      const fullScan = await getTestById(item.id);
      setSelectedScan(fullScan);
    } catch {
      // Fallback to item itself as AnalyzeResult
      setSelectedScan({
        test_id: item.id,
        timestamp: item.timestamp,
        source_type: item.source_type,
        filename_or_label: item.filename_or_label,
        verdict: item.verdict,
        risk_score: item.risk_score,
        confidence: item.confidence,
        reason: item.reason,
        recommended_action: item.recommended_action,
        audio_duration_sec: item.audio_duration_sec,
        chunk_scores: item.chunk_scores,
        acoustic_features: item.acoustic_features,
      });
    } finally {
      setModalLoading(false);
    }
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = [
      "ID",
      "Timestamp",
      "Source",
      "Filename",
      "Verdict",
      "RiskScore",
      "Confidence",
      "DurationSec",
      "Reason",
    ];
    const rows = history.map((item) => [
      item.id,
      item.timestamp,
      item.source_type,
      `"${item.filename_or_label.replace(/"/g, '""')}"`,
      item.verdict,
      item.risk_score,
      item.confidence,
      item.audio_duration_sec,
      `"${item.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voiceguard_threat_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered items
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.filename_or_label
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate statistics
  const totalScans = history.length;
  const syntheticCount = history.filter((i) => i.verdict === "synthetic").length;
  const genuineCount = history.filter((i) => i.verdict === "genuine").length;
  const avgRisk =
    totalScans > 0
      ? (history.reduce((acc, curr) => acc + curr.risk_score, 0) / totalScans).toFixed(1)
      : "0.0";

  const getRiskBadge = (score: number) => {
    if (score < 35) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {score.toFixed(1)}% Safe
        </span>
      );
    }
    if (score <= 65) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          {score.toFixed(1)}% Suspect
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        {score.toFixed(1)}% Clone
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE THREAT AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Threat Logs & Forensics History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Permanent SQLite database of all historical voice scans, deepfake anomalies, and step-up mitigations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700 flex items-center space-x-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Total Scans</span>
            <div className="text-3xl font-extrabold text-white mt-1">{totalScans}</div>
            <span className="text-[11px] text-slate-500">Persistent database records</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Clones Intercepted</span>
            <div className="text-3xl font-extrabold text-rose-400 mt-1">{syntheticCount}</div>
            <span className="text-[11px] text-rose-400/80">Synthetic threats flagged</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Human Clearances</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{genuineCount}</div>
            <span className="text-[11px] text-emerald-400/80">Verified authentic speakers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Average Risk Score</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">
              {avgRisk}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </div>
            <span className="text-[11px] text-slate-500">Across all evaluated audio</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Fingerprint className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Verdict Filter Tabs */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setVerdictFilter("all")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              verdictFilter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setVerdictFilter("synthetic")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              verdictFilter === "synthetic"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Synthetic ({syntheticCount})
          </button>
          <button
            onClick={() => setVerdictFilter("genuine")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              verdictFilter === "genuine"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Genuine ({genuineCount})
          </button>
        </div>
      </div>

      {/* Main Table / List */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <Activity className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300">Loading threat logs from database...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <FileAudio className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Threat Logs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No scan records match your search criteria."
              : "No audio recordings have been scanned yet. Inspect an audio file or run the live shield."}
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all mt-2"
          >
            <Upload className="w-4 h-4" />
            <span>Inspect First File</span>
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Source</th>
                  <th className="py-3.5 px-4 font-semibold">File / Label</th>
                  <th className="py-3.5 px-4 font-semibold">Verdict</th>
                  <th className="py-3.5 px-4 font-semibold">Risk Score</th>
                  <th className="py-3.5 px-4 font-semibold">Confidence</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleInspect(item)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] ${
                          item.source_type === "live"
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {item.source_type === "live" ? (
                          <Radio className="w-3 h-3" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        <span className="capitalize">{item.source_type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white font-semibold font-sans truncate max-w-[200px]">
                      {item.filename_or_label}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.verdict === "synthetic" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>SYNTHETIC</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>GENUINE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(item.risk_score)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {(item.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {item.audio_duration_sec.toFixed(1)}s
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDossier(item.id);
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 transition-colors"
                          title="Generate Court-Admissible Legal Dossier"
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(item);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Inspect Forensics"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      selectedScan.verdict === "synthetic"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {selectedScan.verdict === "synthetic" ? "CRITICAL THREAT" : "AUTHENTIC HUMAN"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(selectedScan.timestamp).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedScan.filename_or_label}
                </h3>
              </div>

              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Verdict Banner */}
            <div
              className={`p-4 rounded-xl border ${
                selectedScan.verdict === "synthetic"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider opacity-80">
                    Overall Risk Rating
                  </div>
                  <div className="text-2xl font-extrabold font-mono mt-0.5">
                    {selectedScan.risk_score.toFixed(1)}%{" "}
                    <span className="text-xs font-normal opacity-80">
                      ({(selectedScan.confidence * 100).toFixed(0)}% Confidence)
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono opacity-80">
                  Duration: {selectedScan.audio_duration_sec.toFixed(2)}s <br />
                  Source: {selectedScan.source_type}
                </div>
              </div>
              <p className="text-xs mt-3 pt-3 border-t border-current/20 leading-relaxed">
                {selectedScan.reason}
              </p>
            </div>

            {/* Mitigation Policy */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono text-xs text-slate-300">
              <span className="text-slate-400 uppercase font-semibold">Recommended Mitigation Policy:</span>
              <p className="pt-1">{selectedScan.recommended_action}</p>
            </div>

            {/* Acoustic Features Breakdown (if available) */}
            {selectedScan.acoustic_features && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">
                  Acoustic Forensics Signature
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Pitch Dynamics ($F_0$)</span>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      {selectedScan.acoustic_features.pitch_std_hz?.toFixed(1) ?? "--"} Hz
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Spectral Flatness</span>
                    <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                      {selectedScan.acoustic_features.spectral_flatness?.toFixed(4) ?? "--"}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Centroid Frequency</span>
                    <div className="text-sm font-bold font-mono text-teal-300 mt-0.5">
                      {selectedScan.acoustic_features.spectral_centroid_hz?.toFixed(0) ?? "--"} Hz
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Vocoder Anomaly</span>
                    <div className="text-sm font-bold font-mono text-rose-300 mt-0.5">
                      {selectedScan.acoustic_features.neural_vocoder_artifact_score?.toFixed(1) ?? "--"}/100
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chunks List */}
            {selectedScan.chunk_scores && selectedScan.chunk_scores.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">
                  Sliding Chunk Timeline Analysis ({selectedScan.chunk_scores.length} windows)
                </h4>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 divide-y divide-slate-800/80 text-xs font-mono bg-slate-950/60">
                  {selectedScan.chunk_scores.map((chunk, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 px-3">
                      <span className="text-slate-400">
                        Chunk #{chunk.chunk_index}: {chunk.start_sec.toFixed(1)}s - {chunk.end_sec.toFixed(1)}s
                      </span>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-[11px] font-bold ${
                            chunk.label === "synthetic" ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {chunk.label.toUpperCase()}
                        </span>
                        <span className="text-slate-300">{chunk.risk_score.toFixed(1)}% Risk</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
              <span className="truncate max-w-xs">UUID: {selectedScan.test_id}</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenDossier(selectedScan.test_id)}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1.5 transition-colors font-semibold"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Generate Court Dossier (Sec 65B)</span>
                </button>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Court-Admissible Legal Case Dossier Modal */}
      {dossierData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-cyan-500/50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl bg-[#080c14]">
            {/* Dossier Header */}
            <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  <Scale className="w-3 h-3 text-cyan-400" />
                  <span>COURT-ADMISSIBLE FORENSIC EVIDENCE DOSSIER</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Electronic Evidence Certificate (Section 65B)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {dossierData.court_admissibility_standard}
                </p>
              </div>

              <button
                onClick={() => setDossierData(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Legal Body */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Official Case Reference ID:</span>
                <span className="text-cyan-300 font-bold">{dossierData.case_reference}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Incident Timestamp (UTC):</span>
                <span className="text-white">{dossierData.timestamp}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Audio Ingestion Channel:</span>
                <span className="text-white">{dossierData.target_channel}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Forensic Liveness Classification:</span>
                <span
                  className={`font-bold ${
                    dossierData.verdict === "synthetic" ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {dossierData.verdict.toUpperCase()} (Risk Score: {dossierData.risk_score.toFixed(1)}%)
                </span>
              </div>

              {/* Statutory Citation */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-500">Statutory Penal Violation Citation:</span>
                <p className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[11px] leading-relaxed">
                  {dossierData.statutory_citation}
                </p>
              </div>

              {/* SHA-256 Checksum */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-500">Cryptographic Chain-of-Custody SHA-256:</span>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 select-all break-all">
                  {dossierData.evidence_sha256}
                </div>
              </div>

              {/* Scientific Findings */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-500">Forensic Scientific Finding:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {dossierData.forensic_scientific_analysis}
                </p>
              </div>

              {/* Chain of Custody Table */}
              <div className="space-y-2 pt-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Immutable Chain-of-Custody Audit Trail
                </span>
                <div className="space-y-1.5">
                  {dossierData.chain_of_custody.map((c, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px]">
                      <div className="flex justify-between text-cyan-300 font-semibold">
                        <span>{c.step}</span>
                        <span className="text-slate-400 font-normal">{c.actor}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{c.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dossier Footer / Print Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-500">
                VoiceGuard AI Autonomous Forensic Core
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Case Dossier</span>
                </button>

                <button
                  onClick={() => setDossierData(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
