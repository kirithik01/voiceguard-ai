"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileCheck,
  Send,
  Download,
  Filter,
  Search,
  Lock,
  ExternalLink,
  Layers,
  Fingerprint,
  FileText,
  Printer
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import {
  getSOCAnalytics,
  updateIncidentStatus,
  dispatchSIEMAlert
} from "@/lib/api";
import { SOCAnalytics, IncidentSummary } from "@/lib/types";

const COLORS = ["#f43f5e", "#f59e0b", "#06b6d4", "#8b5cf6", "#10b981"];

export default function SOCCenterPage() {
  const [analytics, setAnalytics] = useState<SOCAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Alert simulation state
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Compliance Certificate modal state
  const [selectedCertificateIncident, setSelectedCertificateIncident] =
    useState<IncidentSummary | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getSOCAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load SOC analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (scanId: string, newStatus: string) => {
    try {
      await updateIncidentStatus(scanId, newStatus);
      // Optimistic update
      setAnalytics((prev) => {
        if (!prev) return prev;
        const updated = prev.recent_incidents.map((inc) =>
          inc.id === scanId ? { ...inc, incident_status: newStatus } : inc
        );
        return { ...prev, recent_incidents: updated };
      });
    } catch (err: any) {
      alert("Failed to update incident status: " + err.message);
    }
  };

  const handleDispatchSIEM = async (scanId: string) => {
    setDispatchingId(scanId);
    setDispatchSuccess(null);
    try {
      const resp = await dispatchSIEMAlert(scanId);
      setDispatchSuccess(
        `Alert dispatched to ${resp.destination} with incident reference ${resp.alert_payload.cert_in_reporting_code}`
      );
      setTimeout(() => setDispatchSuccess(null), 5000);
    } catch (err: any) {
      alert("Failed to dispatch SIEM alert: " + err.message);
    } finally {
      setDispatchingId(null);
    }
  };

  const filteredIncidents = (analytics?.recent_incidents || []).filter((inc) => {
    const matchesFilter =
      statusFilter === "ALL" || inc.incident_status === statusFilter;
    const matchesSearch = inc.filename_or_label
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>ENTERPRISE SOC INCIDENT RESPONSE & AUDIT DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Operations Center (SOC) Command
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time cyber telemetry, attack vector clustering, SIEM webhook integration, and regulatory fraud compliance certification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700 flex items-center space-x-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* SIEM Dispatch Success Toast */}
      {dispatchSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-mono">{dispatchSuccess}</span>
        </div>
      )}

      {/* KPI Triage Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Audio Evaluated</span>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.total_scans ?? "--"}
          </div>
          <span className="text-[10px] text-slate-500">Inbound streams & files</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-rose-400 uppercase">Open Incidents</span>
          <div className="text-2xl font-extrabold text-rose-400">
            {analytics?.open_incidents ?? "--"}
          </div>
          <span className="text-[10px] text-rose-400/80">Pending analyst review</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-amber-400 uppercase">High-Risk Attacks</span>
          <div className="text-2xl font-extrabold text-amber-400">
            {analytics?.high_risk_attacks ?? "--"}
          </div>
          <span className="text-[10px] text-amber-400/80">Risk score &gt; 65%</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-emerald-400 uppercase">Contained Threats</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {analytics?.contained_threats ?? "--"}
          </div>
          <span className="text-[10px] text-emerald-400/80">Mitigations enforced</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono text-cyan-400 uppercase">Average Risk Index</span>
          <div className="text-2xl font-extrabold text-cyan-300">
            {analytics?.average_risk_score ?? "--"}%
          </div>
          <span className="text-[10px] text-slate-500">Across organization</span>
        </div>
      </div>

      {/* Cyber Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attack Vector Distribution */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Attack Vector Clustering</span>
              </h3>
              <p className="text-xs text-slate-400">
                Categorization of voice impersonation threat scenarios.
              </p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            {analytics?.attack_vectors && analytics.attack_vectors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.attack_vectors}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                >
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                    {analytics.attack_vectors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No attack vector data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Vocoder Family Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Neural Vocoder Signature Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400">
                Acoustic signature classification by synthesis architecture.
              </p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            {analytics?.vocoder_breakdown && analytics.vocoder_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.vocoder_breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {analytics.vocoder_breakdown.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No vocoder breakdown data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incident Triage Queue */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>SOC Incident Triage & Evidence Registry</span>
            </h3>
            <p className="text-xs text-slate-400">
              Manage incident statuses, inspect cryptographic SHA-256 evidence hashes, and dispatch SIEM webhooks.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {["ALL", "OPEN", "INVESTIGATING", "CONTAINED", "FALSE_POSITIVE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === tab
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Incident Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Target / Call</th>
                <th className="py-3 px-4">Threat Verdict</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Triage Status</th>
                <th className="py-3 px-4">Evidence Hash</th>
                <th className="py-3 px-4 text-right">SOC Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/40">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No incidents matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(inc.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-white truncate max-w-[180px]">
                      {inc.filename_or_label}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inc.verdict === "synthetic" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          SYNTHETIC CLONE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          GENUINE HUMAN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">
                      <span
                        style={{
                          color:
                            inc.risk_score < 35
                              ? "#10b981"
                              : inc.risk_score <= 65
                              ? "#f59e0b"
                              : "#f43f5e",
                        }}
                      >
                        {inc.risk_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={inc.incident_status}
                        onChange={(e) => handleUpdateStatus(inc.id, e.target.value)}
                        className={`bg-slate-950 border px-2 py-1 rounded text-[11px] font-mono focus:outline-none ${
                          inc.incident_status === "OPEN"
                            ? "border-rose-500/40 text-rose-300"
                            : inc.incident_status === "INVESTIGATING"
                            ? "border-amber-500/40 text-amber-300"
                            : inc.incident_status === "CONTAINED"
                            ? "border-emerald-500/40 text-emerald-300"
                            : "border-slate-700 text-slate-400"
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="CONTAINED">CONTAINED</option>
                        <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500 select-all truncate max-w-[120px]" title={inc.sha256_hash || "N/A"}>
                      {inc.sha256_hash ? inc.sha256_hash.slice(0, 10) + "..." : "hash_pending"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Dispatch SIEM Alert */}
                        <button
                          onClick={() => handleDispatchSIEM(inc.id)}
                          disabled={dispatchingId === inc.id}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] flex items-center space-x-1 transition-colors"
                          title="Send Webhook Alert to Enterprise SIEM"
                        >
                          <Send className="w-3 h-3" />
                          <span>SIEM Alert</span>
                        </button>

                        {/* View Compliance Certificate */}
                        <button
                          onClick={() => setSelectedCertificateIncident(inc)}
                          className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[11px] flex items-center space-x-1 transition-colors"
                          title="Generate CERT-In Compliance Audit Certificate"
                        >
                          <FileCheck className="w-3 h-3" />
                          <span>Audit Cert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Audit Certificate Modal */}
      {selectedCertificateIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-cyan-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl bg-[#090d16]">
            {/* Certificate Header */}
            <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>OFFICIAL FORENSIC INCIDENT AUDIT CERTIFICATE</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Regulatory Cyber Fraud Evidence Certificate
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Standardized under CERT-In & RBI Voice Authentication Guidelines
                </p>
              </div>

              <button
                onClick={() => setSelectedCertificateIncident(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Certificate Body */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Certificate Reference ID:</span>
                <span className="text-cyan-300 font-bold">
                  CERTIN-FRAUD-{selectedCertificateIncident.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Incident Timestamp (UTC):</span>
                <span className="text-white">{selectedCertificateIncident.timestamp}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Target Voice Channel / File:</span>
                <span className="text-white">{selectedCertificateIncident.filename_or_label}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Forensic Liveness Classification:</span>
                <span
                  className={`font-bold ${
                    selectedCertificateIncident.verdict === "synthetic"
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {selectedCertificateIncident.verdict.toUpperCase()} (Risk Score:{" "}
                  {selectedCertificateIncident.risk_score.toFixed(1)}%)
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">SOC Triage Status:</span>
                <span className="text-amber-300 font-bold">
                  {selectedCertificateIncident.incident_status}
                </span>
              </div>

              {/* SHA-256 Checksum */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-500">Cryptographic Chain-of-Custody SHA-256:</span>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 break-all select-all">
                  {selectedCertificateIncident.sha256_hash ||
                    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </div>
              </div>

              {/* Forensic Scientific Rationale */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-500">Forensic Scientific Finding:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedCertificateIncident.reason}
                </p>
              </div>

              {/* Mitigation Enforced */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-500">Mandated Mitigation Action:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedCertificateIncident.recommended_action}
                </p>
              </div>
            </div>

            {/* Certificate Footer / Print Action */}
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
                  <span>Print Certificate</span>
                </button>

                <button
                  onClick={() => setSelectedCertificateIncident(null)}
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
