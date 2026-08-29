"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Radio,
  Zap,
  ArrowRight,
  Server,
  Lock,
  UserCheck,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { getPBXLines, simulatePBXCall } from "@/lib/api";
import { PBXLine, PBXCallResult } from "@/lib/types";

export default function TelephonyWarRoomPage() {
  const [lines, setLines] = useState<PBXLine[]>([]);
  const [loadingLines, setLoadingLines] = useState<boolean>(true);

  // Call simulation state
  const [selectedLineId, setSelectedLineId] = useState<string>("line_treasury");
  const [callerName, setCallerName] = useState<string>("Chief Executive Officer");
  const [callerNumber, setCallerNumber] = useState<string>("+1 (555) 019-4820");
  const [sampleId, setSampleId] = useState<string>("ceo_clone_wire_fraud");
  const [simulating, setSimulating] = useState<boolean>(false);
  const [callResult, setCallResult] = useState<PBXCallResult | null>(null);

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    setLoadingLines(true);
    try {
      const data = await getPBXLines();
      setLines(data);
    } catch (err) {
      console.error("Failed to load PBX lines:", err);
    } finally {
      setLoadingLines(false);
    }
  };

  const handleSimulateCall = async (customSampleId?: string, name?: string, num?: string) => {
    setSimulating(true);
    setCallResult(null);

    const sId = customSampleId || sampleId;
    const cName = name || callerName;
    const cNum = num || callerNumber;

    try {
      const formData = new FormData();
      formData.append("line_id", selectedLineId);
      formData.append("caller_name", cName);
      formData.append("caller_number", cNum);
      formData.append("sample_id", sId);
      const result = await simulatePBXCall(formData);
      setCallResult(result);
    } catch (err: any) {
      alert("PBX Call simulation failed: " + (err.message || "Unknown error"));
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <PhoneForwarded className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>ENTERPRISE SIP TRUNK & PBX GATEWAY WAR ROOM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Telephony Gateway & In-Line SIP War Room
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Autonomous SIP proxy with real-time in-call deepfake detection and automatic call blacklisting.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLines}
            className="p-2 rounded-xl bg-[#F3EEFB] hover:bg-[#EAF6F2] text-[#7A7390] hover:text-[#3A3450] border border-[#E3DCF0] transition-colors"
            title="Refresh Trunk Lines"
          >
            <RotateCcw className={`w-4 h-4 ${loadingLines ? "animate-spin text-[#8E79C9]" : ""}`} />
          </button>
        </div>
      </div>

      {/* PBX Gateway Trunk Lines Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#8E79C9]" />
            <span>Monitored PBX Trunk Lines</span>
          </h2>
          <span className="text-xs font-mono text-[#7A7390]">
            Autonomous SIP In-Line Filtering: Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lines.map((line) => {
            const isSelected = selectedLineId === line.line_id;
            return (
              <div
                key={line.line_id}
                onClick={() => setSelectedLineId(line.line_id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? "bg-[#F3EEFB] border-[#B8A6E8] shadow-md"
                    : "bg-[#FBF7F4] border-[#E3DCF0] hover:border-[#B8A6E8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#3A3450]">
                    Ext {line.extension}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E5B] animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-[#3A3450] mt-1">{line.name}</h3>
                <p className="text-xs text-[#7A7390] mt-0.5">{line.status || "Live Protected Line"}</p>
                <div className="mt-3 pt-2 border-t border-[#E3DCF0] flex items-center justify-between text-[11px] font-mono text-[#7A7390]">
                  <span>SIP Channel</span>
                  <span className="text-[#2E9E5B] font-bold">100% Protected</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Telecom Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Quick Attack Vector Dispatcher */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#C98A1F]" />
              <span>Simulated Inbound Calls</span>
            </h3>
          </div>

          <div className="space-y-3">
            {/* Scenario 1: CEO Voice Clone Wire Fraud */}
            <div
              onClick={() => {
                setCallerName("Chief Executive Officer");
                setCallerNumber("+1 (555) 019-4820");
                setSampleId("ceo_clone_wire_fraud");
                handleSimulateCall("ceo_clone_wire_fraud", "Chief Executive Officer (AI Clone)", "+1 (555) 019-4820");
              }}
              className="p-5 rounded-3xl bg-[#FCE4E4] border border-[#D6395B]/40 hover:border-[#D6395B] cursor-pointer transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FCE4E4] text-[#D6395B] border border-[#D6395B]">
                  CRITICAL THREAT
                </span>
                <PhoneCall className="w-4 h-4 text-[#D6395B] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-[#D6395B]">CEO Wire Transfer Urgent Authorization</h4>
              <p className="text-[11px] text-[#3A3450] leading-relaxed font-medium">
                High-stakes synthetic voice clone mimicking CEO authorizing $450k wire transfer to offshore account.
              </p>
            </div>

            {/* Scenario 2: Helpdesk MFA Credential Probe */}
            <div
              onClick={() => {
                setCallerName("Helpdesk IT Admin");
                setCallerNumber("+1 (555) 014-9921");
                setSampleId("deepfake_helpdesk_reset");
                handleSimulateCall("deepfake_helpdesk_reset", "Helpdesk MFA Reset Probe", "+1 (555) 014-9921");
              }}
              className="p-5 rounded-3xl bg-[#FDF3DA] border border-[#C98A1F]/40 hover:border-[#C98A1F] cursor-pointer transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDF3DA] text-[#C98A1F] border border-[#C98A1F]">
                  CREDENTIAL PROBE
                </span>
                <PhoneCall className="w-4 h-4 text-[#C98A1F] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-[#C98A1F]">IT Service Desk Password Reset</h4>
              <p className="text-[11px] text-[#3A3450] leading-relaxed font-medium">
                Synthetic voice probe impersonating internal employee to bypass Okta MFA on Ext 4040.
              </p>
            </div>

            {/* Scenario 3: Authentic Executive Authentication */}
            <div
              onClick={() => {
                setCallerName("Rajesh Verma (CEO)");
                setCallerNumber("+1 (555) 018-7733");
                setSampleId("human_executive_auth");
                handleSimulateCall("human_executive_auth", "Rajesh Verma (Genuine CEO)", "+1 (555) 018-7733");
              }}
              className="p-5 rounded-3xl bg-[#DFF5E6] border border-[#2E9E5B]/40 hover:border-[#2E9E5B] cursor-pointer transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#DFF5E6] text-[#2E9E5B] border border-[#2E9E5B]">
                  GENUINE HUMAN
                </span>
                <PhoneCall className="w-4 h-4 text-[#2E9E5B] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-[#2E9E5B]">Authentic Executive Voice Auth</h4>
              <p className="text-[11px] text-[#3A3450] leading-relaxed font-medium">
                Legitimate human executive verbal authorization with natural vocal tract prosody.
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Autonomous Routing Decision Display */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#8E79C9]" />
                <span>In-Line PBX Autonomous Intercept Engine</span>
              </h2>
              <p className="text-xs text-[#7A7390] mt-1">
                Every inbound call packet is analyzed in &lt;150ms before human bridge connects.
              </p>
            </div>

            {/* Inbound Call Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-[#7A7390] block mb-1 font-semibold">Target PBX Line:</label>
                <select
                  value={selectedLineId}
                  onChange={(e) => setSelectedLineId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-[#3A3450] focus:outline-none focus:border-[#B8A6E8]"
                >
                  {lines.map((l) => (
                    <option key={l.line_id} value={l.line_id}>
                      {l.name} (Ext {l.extension})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#7A7390] block mb-1 font-semibold">Inbound Caller Number:</label>
                <input
                  type="text"
                  value={callerNumber}
                  onChange={(e) => setCallerNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] text-[#3A3450] focus:outline-none focus:border-[#B8A6E8]"
                />
              </div>
            </div>

            <button
              onClick={() => handleSimulateCall()}
              disabled={simulating}
              className="w-full py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#3A3450]" />
                  <span>Processing SIP Packet Stream & Acoustic Forensics...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 text-[#3A3450]" />
                  <span>Dispatch Inbound Telecom Call</span>
                </>
              )}
            </button>
          </div>

          {/* Autonomous Routing Result Banner */}
          {callResult && (
            <div className="space-y-5 animate-fadeIn">
              <div
                className={`rounded-3xl p-6 sm:p-7 border-2 transition-all shadow-md ${
                  callResult.routing_decision === "ROUTE_TO_AGENT"
                    ? "bg-[#DFF5E6] border-[#2E9E5B]"
                    : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                    ? "bg-[#FDF3DA] border-[#C98A1F]"
                    : "bg-[#FCE4E4] border-[#D6395B]"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      callResult.routing_decision === "ROUTE_TO_AGENT"
                        ? "bg-[#2E9E5B] text-white"
                        : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                        ? "bg-[#C98A1F] text-white"
                        : "bg-[#D6395B] text-white pulse-alert"
                    }`}
                  >
                    {callResult.routing_decision === "ROUTE_TO_AGENT" ? (
                      <PhoneForwarded className="w-7 h-7" />
                    ) : callResult.routing_decision === "DIVERT_TO_OTP_IVR" ? (
                      <Bot className="w-7 h-7" />
                    ) : (
                      <PhoneOff className="w-7 h-7" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 text-[#3A3450] border border-[#E3DCF0]">
                        SIP {callResult.sip_response_code}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm ${
                          callResult.routing_decision === "ROUTE_TO_AGENT"
                            ? "bg-[#2E9E5B]"
                            : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                            ? "bg-[#C98A1F]"
                            : "bg-[#D6395B]"
                        }`}
                      >
                        {callResult.routing_decision}
                      </span>
                    </div>

                    <h3
                      className={`text-xl font-black mt-1 ${
                        callResult.routing_decision === "ROUTE_TO_AGENT"
                          ? "text-[#2E9E5B]"
                          : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                          ? "text-[#C98A1F]"
                          : "text-[#D6395B]"
                      }`}
                    >
                      {callResult.routing_decision === "ROUTE_TO_AGENT"
                        ? `Call Approved: Connected to Ext ${callResult.extension}`
                        : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                        ? `Suspicious Call Diverted to VoiceGuard Vocal OTP Challenge`
                        : `Call Terminated: Clone Intercepted & Blacklisted`}
                    </h3>

                    <p className="text-xs text-[#3A3450] leading-relaxed max-w-2xl font-medium">
                      {callResult.routing_reason}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3DCF0] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#7A7390] gap-2">
                  <span>Call Reference: {callResult.call_id}</span>
                  <span>Risk Score: {callResult.risk_score.toFixed(1)}%</span>
                  <span
                    className={
                      callResult.blacklist_status === "GLOBAL_ENTERPRISE_BLACKLIST"
                        ? "text-[#D6395B] font-bold"
                        : "text-[#2E9E5B] font-bold"
                    }
                  >
                    Blacklist: {callResult.blacklist_status}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#EAF6F2] p-5 rounded-3xl border border-[#E3DCF0] text-xs font-mono shadow-sm">
                <span className="text-[#3A3450] font-medium">
                  Incident logged in SQLite Threat Ledger with SHA-256 evidence.
                </span>

                <div className="flex items-center space-x-3">
                  <Link
                    href="/soc"
                    className="px-3.5 py-1.5 rounded-xl bg-[#FBF7F4] hover:bg-[#F3EEFB] text-[#3A3450] border border-[#E3DCF0] font-bold flex items-center space-x-1 shadow-xs"
                  >
                    <span>View in SOC Center</span>
                    <ArrowRight className="w-3 h-3 text-[#8E79C9]" />
                  </Link>

                  <Link
                    href="/benchmark"
                    className="px-3.5 py-1.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold flex items-center space-x-1 shadow-xs"
                  >
                    <span>Stress Test in Benchmark Lab</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
