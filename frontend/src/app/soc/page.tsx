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

const COLORS = ["#D6395B", "#C98A1F", "#8E79C9", "#A7D8D0", "#2E9E5B"];

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
      console.error("Failed to fetch SOC analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateIncidentStatus(id, newStatus);
      // Refresh local data
      await fetchAnalytics();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDispatchSIEM = async (incidentId: string) => {
    setDispatchingId(incidentId);
    setDispatchSuccess(null);
    try {
      const resp = await dispatchSIEMAlert(incidentId);
      setDispatchSuccess(`SIEM Dispatched: Alert status "${resp.status}" forwarded to ${resp.destination}.`);
      setTimeout(() => setDispatchSuccess(null), 5000);
    } catch (err: any) {
      alert("Failed to dispatch SIEM alert: " + err.message);
    } finally {
      setDispatchingId(null);
    }
  };

  const filteredIncidents =
    analytics?.recent_incidents?.filter((inc: IncidentSummary) => {
      const matchesStatus =
        statusFilter === "ALL" || inc.incident_status === statusFilter;
      const matchesSearch = inc.filename_or_label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>ENTERPRISE SOC INCIDENT COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Security Operations Center (SOC) Console
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Real-time incident triage, vocoder cluster distribution, and SIEM webhook dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-[#F3EEFB] hover:bg-[#EAF6F2] text-[#7A7390] hover:text-[#3A3450] border border-[#E3DCF0] transition-colors"
            title="Refresh Telemetry"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-[#8E79C9]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alert status notification */}
      {dispatchSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#DFF5E6] border border-[#2E9E5B] text-[#2E9E5B] text-xs font-bold flex items-center space-x-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* KPI Triage Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-[#7A7390] uppercase font-semibold">Total Audio Evaluated</span>
          <div className="text-2xl font-black text-[#3A3450] font-mono">
            {analytics?.total_scans ?? "--"}
          </div>
          <span className="text-[10px] text-[#7A7390]">Inbound streams & files</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FCE4E4] border border-[#D6395B]/40 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-[#D6395B] uppercase font-bold">Open Incidents</span>
          <div className="text-2xl font-black text-[#D6395B] font-mono">
            {analytics?.open_incidents ?? "--"}
          </div>
          <span className="text-[10px] text-[#D6395B]/80 font-medium">Pending analyst review</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FDF3DA] border border-[#C98A1F]/40 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-[#C98A1F] uppercase font-bold">High-Risk Attacks</span>
          <div className="text-2xl font-black text-[#C98A1F] font-mono">
            {analytics?.high_risk_attacks ?? "--"}
          </div>
          <span className="text-[10px] text-[#C98A1F]/80 font-medium">Risk score &gt; 65%</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#DFF5E6] border border-[#2E9E5B]/40 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-[#2E9E5B] uppercase font-bold">Contained Threats</span>
          <div className="text-2xl font-black text-[#2E9E5B] font-mono">
            {analytics?.contained_threats ?? "--"}
          </div>
          <span className="text-[10px] text-[#2E9E5B]/80 font-medium">Mitigations enforced</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 col-span-2 sm:col-span-1 shadow-sm">
          <span className="text-[11px] font-mono text-[#7c63c7] uppercase font-semibold">Average Risk Index</span>
          <div className="text-2xl font-black text-[#7c63c7] font-mono">
            {analytics?.average_risk_score ?? "--"}%
          </div>
          <span className="text-[10px] text-[#7A7390]">Across organization</span>
        </div>
      </div>

      {/* Cyber Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attack Vector Distribution */}
        <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#8E79C9]" />
                <span>Attack Vector Clustering</span>
              </h3>
              <p className="text-xs text-[#7A7390]">
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
                  <XAxis type="number" stroke="#7A7390" fontSize={10} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#7A7390"
                    fontSize={11}
                    tickLine={false}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#F3EEFB",
                      borderColor: "#E3DCF0",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#3A3450",
                    }}
                  />
                  <Bar dataKey="value" fill="#8E79C9" radius={[0, 4, 4, 0]}>
                    {analytics.attack_vectors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7A7390]">
                No attack vector data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Vocoder Family Breakdown */}
        <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#D6395B]" />
                <span>Neural Vocoder Signature Breakdown</span>
              </h3>
              <p className="text-xs text-[#7A7390]">
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
                      backgroundColor: "#F3EEFB",
                      borderColor: "#E3DCF0",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#3A3450",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7A7390]">
                No vocoder breakdown data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Threat Incident Queue Table */}
      <div className="rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E3DCF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#3A3450]">
              Active Incident Queue & Workflow Triage
            </h3>
            <p className="text-xs text-[#7A7390]">
              Change triage status or dispatch enterprise SIEM alert webhooks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Filter incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs text-[#3A3450] placeholder:text-[#7A7390] focus:outline-none focus:border-[#B8A6E8]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-xs font-mono text-[#3A3450] focus:outline-none focus:border-[#B8A6E8]"
            >
              <option value="ALL">All Triage Status</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="CONTAINED">CONTAINED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F3EEFB] text-[#7A7390] uppercase tracking-wider border-b border-[#E3DCF0]">
              <tr>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Target / Call</th>
                <th className="py-3 px-4 font-bold">Threat Verdict</th>
                <th className="py-3 px-4 font-bold">Risk</th>
                <th className="py-3 px-4 font-bold">Triage Status</th>
                <th className="py-3 px-4 font-bold">Evidence Hash</th>
                <th className="py-3 px-4 font-bold text-right">SOC Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DCF0] bg-[#FBF7F4]">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7A7390]">
                    No incidents matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#EAF6F2] transition-colors">
                    <td className="py-3 px-4 text-[#7A7390] whitespace-nowrap">
                      {new Date(inc.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-[#3A3450] truncate max-w-[180px]">
                      {inc.filename_or_label}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inc.verdict === "synthetic" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]">
                          SYNTHETIC CLONE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]">
                          GENUINE HUMAN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">
                      <span
                        style={{
                          color:
                            inc.risk_score < 35
                              ? "#2E9E5B"
                              : inc.risk_score <= 65
                              ? "#C98A1F"
                              : "#D6395B",
                        }}
                      >
                        {inc.risk_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={inc.incident_status}
                        onChange={(e) => handleUpdateStatus(inc.id, e.target.value)}
                        className={`bg-[#FBF7F4] border px-2 py-1 rounded-lg text-[11px] font-mono focus:outline-none ${
                          inc.incident_status === "OPEN"
                            ? "border-[#D6395B] text-[#D6395B] font-bold"
                            : inc.incident_status === "INVESTIGATING"
                            ? "border-[#C98A1F] text-[#C98A1F] font-bold"
                            : inc.incident_status === "CONTAINED"
                            ? "border-[#2E9E5B] text-[#2E9E5B] font-bold"
                            : "border-[#E3DCF0] text-[#7A7390]"
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="CONTAINED">CONTAINED</option>
                        <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-[#7A7390] select-all truncate max-w-[120px]" title={inc.sha256_hash || "N/A"}>
                      {inc.sha256_hash ? inc.sha256_hash.slice(0, 10) + "..." : "hash_pending"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Dispatch SIEM Alert */}
                        <button
                          onClick={() => handleDispatchSIEM(inc.id)}
                          disabled={dispatchingId === inc.id}
                          className="px-2.5 py-1 rounded-lg bg-[#F3EEFB] hover:bg-[#EAF6F2] text-[#3A3450] border border-[#E3DCF0] text-[11px] font-bold flex items-center space-x-1 transition-colors shadow-xs"
                          title="Send Webhook Alert to Enterprise SIEM"
                        >
                          <Send className="w-3 h-3 text-[#8E79C9]" />
                          <span>SIEM Alert</span>
                        </button>

                        {/* View Compliance Certificate */}
                        <button
                          onClick={() => setSelectedCertificateIncident(inc)}
                          className="px-2.5 py-1 rounded-lg bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] text-[11px] font-bold flex items-center space-x-1 transition-colors shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FBF7F4] border border-[#E3DCF0] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Certificate Header */}
            <div className="border-b border-[#E3DCF0] pb-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#B8A6E8]/30 border border-[#B8A6E8] text-[10px] font-mono text-[#3A3450] font-bold">
                  <ShieldCheck className="w-3 h-3 text-[#3A3450]" />
                  <span>OFFICIAL FORENSIC INCIDENT AUDIT CERTIFICATE</span>
                </div>
                <h3 className="text-xl font-bold text-[#3A3450] mt-1">
                  Regulatory Cyber Fraud Evidence Certificate
                </h3>
                <p className="text-xs text-[#7A7390] font-mono">
                  Standardized under CERT-In & RBI Voice Authentication Guidelines
                </p>
              </div>

              <button
                onClick={() => setSelectedCertificateIncident(null)}
                className="text-[#7A7390] hover:text-[#3A3450] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Certificate Body */}
            <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-4 font-mono text-xs text-[#3A3450]">
              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Certificate Reference ID:</span>
                <span className="text-[#7c63c7] font-bold">
                  CERTIN-FRAUD-{selectedCertificateIncident.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Incident Timestamp (UTC):</span>
                <span className="text-[#3A3450] font-semibold">{selectedCertificateIncident.timestamp}</span>
              </div>

              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Forensic Threat Verdict:</span>
                <span
                  className={`font-bold ${
                    selectedCertificateIncident.verdict === "synthetic"
                      ? "text-[#D6395B]"
                      : "text-[#2E9E5B]"
                  }`}
                >
                  {selectedCertificateIncident.verdict.toUpperCase()} (Risk Score:{" "}
                  {selectedCertificateIncident.risk_score.toFixed(1)}%)
                </span>
              </div>

              <div className="flex justify-between border-b border-[#E3DCF0] pb-2">
                <span className="text-[#7A7390]">Cryptographic Evidence SHA-256:</span>
                <span className="text-[#7c63c7] font-bold select-all truncate max-w-[280px]">
                  {selectedCertificateIncident.sha256_hash || "SHA256_VERIFIED_AUTHENTIC"}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[#7A7390]">Statutory Compliance Statement:</span>
                <p className="p-3 rounded-xl bg-[#EAF6F2] border border-[#E3DCF0] text-[#3A3450] text-[11px] leading-relaxed font-semibold">
                  This electronic forensic certificate affirms that VoiceGuard AI intercepted and cataloged this audio event in accordance with Indian IT Act (Sec 66D/43A) and RBI Cyber Security Framework for digital banking voice channels.
                </p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-[#7A7390]">
                VoiceGuard Enterprise SOC
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>

                <button
                  onClick={() => setSelectedCertificateIncident(null)}
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
