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
    if (!confirm("Are you sure you want to permanently delete this scan record?")) return;
    try {
      await deleteTestById(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedScan && selectedScan.test_id === id) {
        setSelectedScan(null);
      }
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("WARNING: This will permanently wipe ALL threat log entries. Continue?")) return;
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
      const detailed = await getTestById(item.id);
      setSelectedScan(detailed);
    } catch (err) {
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
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]">
          {score.toFixed(1)}% Safe
        </span>
      );
    }
    if (score <= 65) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FDF3DA] text-[#C98A1F] border border-[#C98A1F]">
          {score.toFixed(1)}% Suspect
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]">
        {score.toFixed(1)}% Clone
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>ENTERPRISE THREAT AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Threat Logs & Forensics History
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Permanent SQLite database of all historical voice scans, deepfake anomalies, and court-admissible dossiers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="px-4 py-2 rounded-xl bg-[#EAF6F2] hover:bg-[#d6eee6] border border-[#E3DCF0] text-xs font-semibold text-[#3A3450] transition-all flex items-center space-x-1.5 disabled:opacity-40 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#3A3450]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="px-4 py-2 rounded-xl bg-[#FCE4E4] hover:bg-[#F9D2D2] border border-[#D6395B] text-xs font-bold text-[#D6395B] transition-all flex items-center space-x-1.5 disabled:opacity-40 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
          <span className="text-xs font-mono text-[#7A7390] uppercase font-semibold">Total Scans Audited</span>
          <div className="text-3xl font-black text-[#3A3450] font-mono">{totalScans}</div>
          <span className="text-[11px] text-[#7A7390]">Across live & file channels</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FCE4E4] border border-[#D6395B]/40 space-y-1 shadow-sm">
          <span className="text-xs font-mono text-[#D6395B] uppercase font-bold">Threats Intercepted</span>
          <div className="text-3xl font-black text-[#D6395B] font-mono">{syntheticCount}</div>
          <span className="text-[11px] text-[#D6395B]/80 font-medium">Clones flagged & blocked</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#DFF5E6] border border-[#2E9E5B]/40 space-y-1 shadow-sm">
          <span className="text-xs font-mono text-[#2E9E5B] uppercase font-bold">Human Verified</span>
          <div className="text-3xl font-black text-[#2E9E5B] font-mono">{genuineCount}</div>
          <span className="text-[11px] text-[#2E9E5B]/80 font-medium">Organic biological voices</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
          <span className="text-xs font-mono text-[#7A7390] uppercase font-semibold">Average Risk Rating</span>
          <div className="text-3xl font-black text-[#7c63c7] font-mono">{avgRisk}%</div>
          <span className="text-[11px] text-[#7A7390]">Mean composite score</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7A7390] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by label or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FBF7F4] border border-[#E3DCF0] rounded-xl text-xs text-[#3A3450] placeholder-[#7A7390] focus:outline-none focus:border-[#B8A6E8] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#7A7390] shrink-0" />
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#FBF7F4] border border-[#E3DCF0] rounded-xl text-xs font-mono text-[#3A3450] focus:outline-none focus:border-[#B8A6E8]"
          >
            <option value="all">All Verdicts</option>
            <option value="synthetic">Synthetic Clones Only</option>
            <option value="genuine">Genuine Human Only</option>
          </select>
        </div>
      </div>

      {/* Main Table / List on Base Background */}
      {loading ? (
        <div className="rounded-3xl p-12 text-center bg-[#F3EEFB] border border-[#E3DCF0] shadow-sm">
          <Activity className="w-8 h-8 animate-spin text-[#8E79C9] mx-auto mb-3" />
          <p className="text-sm text-[#3A3450] font-semibold">Loading threat logs from database...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-[#F3EEFB] border border-[#E3DCF0] space-y-3 shadow-sm">
          <FileAudio className="w-12 h-12 text-[#7A7390] mx-auto" />
          <h3 className="text-base font-bold text-[#3A3450]">No Threat Logs Found</h3>
          <p className="text-xs text-[#7A7390] max-w-sm mx-auto">
            {searchQuery
              ? "No scan records match your search criteria."
              : "No audio recordings have been scanned yet. Inspect an audio file or run the live shield."}
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-sm transition-all mt-2"
          >
            <Upload className="w-4 h-4" />
            <span>Inspect First File</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E3DCF0] overflow-hidden shadow-sm bg-[#FBF7F4]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EEFB] text-[#7A7390] uppercase font-mono tracking-wider border-b border-[#E3DCF0]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Source</th>
                  <th className="py-3.5 px-4 font-bold">File / Label</th>
                  <th className="py-3.5 px-4 font-bold">Verdict</th>
                  <th className="py-3.5 px-4 font-bold">Risk Score</th>
                  <th className="py-3.5 px-4 font-bold">Confidence</th>
                  <th className="py-3.5 px-4 font-bold">Duration</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCF0] font-mono bg-[#FBF7F4]">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleInspect(item)}
                    className="hover:bg-[#EAF6F2] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-[#7A7390] whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          item.source_type === "live"
                            ? "bg-[#B8A6E8]/30 text-[#3A3450] border border-[#B8A6E8]"
                            : "bg-[#A7D8D0]/40 text-[#3A3450] border border-[#A7D8D0]"
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
                    <td className="py-3.5 px-4 text-[#3A3450] font-bold font-sans truncate max-w-[200px]">
                      {item.filename_or_label}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.verdict === "synthetic" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>SYNTHETIC</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>GENUINE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(item.risk_score)}
                    </td>
                    <td className="py-3.5 px-4 text-[#3A3450] whitespace-nowrap font-bold">
                      {(item.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-[#7A7390] whitespace-nowrap">
                      {item.audio_duration_sec.toFixed(1)}s
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDossier(item.id);
                          }}
                          className="p-1.5 rounded-lg bg-[#EAF6F2] hover:bg-[#d6eee6] text-[#3A3450] border border-[#E3DCF0] transition-colors"
                          title="Generate Court-Admissible Legal Dossier"
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(item);
                          }}
                          className="p-1.5 rounded-lg bg-[#F3EEFB] hover:bg-[#E3DCF0] text-[#3A3450] border border-[#E3DCF0] transition-colors"
                          title="Inspect Forensics"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-lg bg-[#FCE4E4] hover:bg-[#F9D2D2] text-[#D6395B] border border-[#D6395B] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F3EEFB] border border-[#E3DCF0] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E3DCF0] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      selectedScan.verdict === "synthetic"
                        ? "bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]"
                        : "bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]"
                    }`}
                  >
                    {selectedScan.verdict === "synthetic" ? "CRITICAL THREAT" : "AUTHENTIC HUMAN"}
                  </span>
                  <span className="text-xs font-mono text-[#7A7390]">
                    {new Date(selectedScan.timestamp).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#3A3450] mt-1">
                  {selectedScan.filename_or_label}
                </h3>
              </div>

              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 rounded-xl bg-[#FBF7F4] hover:bg-[#EAF6F2] text-[#7A7390] hover:text-[#3A3450] transition-colors border border-[#E3DCF0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Verdict Banner */}
            <div
              className={`p-5 rounded-2xl border-2 ${
                selectedScan.verdict === "synthetic"
                  ? "bg-[#FCE4E4] border-[#D6395B] text-[#3A3450]"
                  : "bg-[#DFF5E6] border-[#2E9E5B] text-[#3A3450]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider font-semibold text-[#7A7390]">
                    Overall Risk Rating
                  </div>
                  <div
                    className={`text-3xl font-black font-mono mt-0.5 ${
                      selectedScan.verdict === "synthetic" ? "text-[#D6395B]" : "text-[#2E9E5B]"
                    }`}
                  >
                    {selectedScan.risk_score.toFixed(1)}%{" "}
                    <span className="text-xs font-normal text-[#7A7390]">
                      ({(selectedScan.confidence * 100).toFixed(0)}% Confidence)
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-[#7A7390]">
                  Duration: {selectedScan.audio_duration_sec.toFixed(2)}s <br />
                  Source: {selectedScan.source_type}
                </div>
              </div>
              <p className="text-xs mt-3 pt-3 border-t border-[#E3DCF0] leading-relaxed font-medium">
                {selectedScan.reason}
              </p>
            </div>

            {/* Mitigation Policy */}
            <div className="p-4 rounded-2xl bg-[#EAF6F2] border border-[#E3DCF0] space-y-1 font-mono text-xs text-[#3A3450]">
              <span className="text-[#7A7390] uppercase font-bold">Recommended Mitigation Policy:</span>
              <p className="pt-1 font-semibold">{selectedScan.recommended_action}</p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E3DCF0] text-xs font-mono text-[#7A7390]">
              <span className="truncate max-w-xs">UUID: {selectedScan.test_id}</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenDossier(selectedScan.test_id)}
                  className="px-3.5 py-2 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Generate Court Dossier (Sec 65B)</span>
                </button>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 rounded-xl bg-[#FBF7F4] hover:bg-[#EAF6F2] text-[#3A3450] font-semibold border border-[#E3DCF0] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FBF7F4] border border-[#E3DCF0] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Dossier Header */}
            <div className="border-b border-[#E3DCF0] pb-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#B8A6E8]/30 border border-[#B8A6E8] text-[10px] font-mono text-[#3A3450] font-bold">
                  <Scale className="w-3 h-3 text-[#3A3450]" />
                  <span>COURT-ADMISSIBLE FORENSIC EVIDENCE DOSSIER</span>
                </div>
                <h3 className="text-xl font-bold text-[#3A3450] mt-1">
                  Electronic Evidence Certificate (Section 65B)
                </h3>
                <p className="text-xs text-[#7A7390] font-mono">
                  {dossierData.court_admissibility_standard}
                </p>
              </div>

              <button
                onClick={() => setDossierData(null)}
                className="text-[#7A7390] hover:text-[#3A3450] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Legal Body */}
            <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-4 font-mono text-xs text-[#3A3450]">
              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Official Case Reference ID:</span>
                <span className="text-[#7c63c7] font-bold">{dossierData.case_reference}</span>
              </div>

              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Incident Timestamp (UTC):</span>
                <span className="text-[#3A3450] font-semibold">{dossierData.timestamp}</span>
              </div>

              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Audio Ingestion Channel:</span>
                <span className="text-[#3A3450] font-semibold">{dossierData.target_channel}</span>
              </div>

              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Forensic Liveness Classification:</span>
                <span
                  className={`font-bold ${
                    dossierData.verdict === "synthetic" ? "text-[#D6395B]" : "text-[#2E9E5B]"
                  }`}
                >
                  {dossierData.verdict.toUpperCase()} (Risk Score: {dossierData.risk_score.toFixed(1)}%)
                </span>
              </div>

              {/* Statutory Citation */}
              <div className="space-y-1 pt-1">
                <span className="text-[#7A7390]">Statutory Penal Violation Citation:</span>
                <p className="p-3 rounded-xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-[11px] leading-relaxed font-semibold">
                  {dossierData.statutory_citation}
                </p>
              </div>

              {/* SHA-256 Checksum */}
              <div className="space-y-1 pt-1">
                <span className="text-[#7A7390]">Cryptographic Chain-of-Custody SHA-256:</span>
                <div className="p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-[11px] text-[#7c63c7] select-all break-all font-bold">
                  {dossierData.evidence_sha256}
                </div>
              </div>

              {/* Scientific Findings */}
              <div className="space-y-1 pt-1">
                <span className="text-[#7A7390]">Forensic Scientific Finding:</span>
                <p className="text-[#3A3450] text-[11px] leading-relaxed">
                  {dossierData.forensic_scientific_analysis}
                </p>
              </div>

              {/* Chain of Custody Table */}
              <div className="space-y-2 pt-2">
                <span className="text-[#3A3450] font-bold uppercase text-[10px]">
                  Immutable Chain-of-Custody Audit Trail
                </span>
                <div className="space-y-1.5">
                  {dossierData.chain_of_custody.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-[11px]">
                      <div className="flex justify-between text-[#7c63c7] font-semibold">
                        <span>{c.step}</span>
                        <span className="text-[#7A7390] font-normal">{c.actor}</span>
                      </div>
                      <p className="text-[#7A7390] mt-0.5">{c.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dossier Footer / Print Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-[#7A7390]">
                VoiceGuard AI Autonomous Forensic Core
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Case Dossier</span>
                </button>

                <button
                  onClick={() => setDossierData(null)}
                  className="px-4 py-2 rounded-xl bg-[#EAF6F2] hover:bg-[#d6eee6] text-[#3A3450] text-xs font-semibold border border-[#E3DCF0] transition-colors"
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
