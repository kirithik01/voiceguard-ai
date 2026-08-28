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
      if (sId) {
        formData.append("sample_id", sId);
      }

      const res = await simulatePBXCall(formData);
      setCallResult(res);
      // Refresh line states
      fetchLines();
    } catch (err: any) {
      alert("PBX Call simulation failed: " + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE TELEPHONY GATEWAY & AUTONOMOUS PBX INTERCEPTOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Telephony Gateway War Room
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time SIP trunk switchboard monitoring, in-line acoustic deepfake interception, and autonomous call routing (Operator Transfer, Vocal OTP IVR, or Immediate Disconnect).
          </p>
        </div>

        <button
          onClick={fetchLines}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Trunks</span>
        </button>
      </div>

      {/* Switchboard Trunks Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Active Enterprise PBX Trunks & Extensions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lines.map((line) => {
            const isSelected = selectedLineId === line.line_id;
            return (
              <div
                key={line.line_id}
                onClick={() => setSelectedLineId(line.line_id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "glass-panel border-cyan-500/70 shadow-lg shadow-cyan-500/15"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    EXT {line.extension}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      line.last_decision === "TERMINATE_AND_BLACKLIST"
                        ? "bg-rose-500/20 text-rose-400"
                        : line.last_decision === "DIVERT_TO_OTP_IVR"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {line.last_decision}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{line.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Last Caller: <span className="text-slate-200">{line.last_caller}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>SIP Trunk Online</span>
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {isSelected ? "Active Target" : "Select Line"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive In-Line PBX Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preset Attack Scenarios */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>1-Click Telecom Attack Vectors</span>
          </h2>

          <div className="space-y-3">
            {/* Scenario 1: CEO Wire Fraud Clone */}
            <div
              onClick={() => {
                setCallerName("Chief Executive Officer");
                setCallerNumber("+1 (555) 019-4820");
                setSampleId("ceo_clone_wire_fraud");
                handleSimulateCall("ceo_clone_wire_fraud", "CEO Clone (Wire Fraud)", "+1 (555) 019-4820");
              }}
              className="p-4 rounded-xl glass-panel-danger border border-rose-500/40 hover:border-rose-500/80 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CRITICAL THREAT
                </span>
                <PhoneCall className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white">CEO Wire Transfer Clone</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Neural clone impersonating the CEO demanding $450k offshore wire transfer on Ext 8010.
              </p>
            </div>

            {/* Scenario 2: Helpdesk Admin Reset Probe */}
            <div
              onClick={() => {
                setCallerName("Helpdesk IT Admin");
                setCallerNumber("+1 (555) 014-9921");
                setSampleId("deepfake_helpdesk_reset");
                handleSimulateCall("deepfake_helpdesk_reset", "Helpdesk MFA Reset Probe", "+1 (555) 014-9921");
              }}
              className="p-4 rounded-xl glass-panel border border-amber-500/40 hover:border-amber-500/80 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CREDENTIAL PROBE
                </span>
                <PhoneCall className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white">IT Service Desk Password Reset</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
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
              className="p-4 rounded-xl glass-panel-safe border border-emerald-500/40 hover:border-emerald-500/80 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GENUINE HUMAN
                </span>
                <PhoneCall className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white">Authentic Executive Voice Auth</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Legitimate human executive verbal authorization with natural vocal tract prosody.
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Autonomous Routing Decision Display */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>In-Line PBX Autonomous Intercept Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Every inbound call packet is analyzed in &lt;150ms before human bridge connects.
              </p>
            </div>

            {/* Inbound Call Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Target PBX Line:</label>
                <select
                  value={selectedLineId}
                  onChange={(e) => setSelectedLineId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  {lines.map((l) => (
                    <option key={l.line_id} value={l.line_id}>
                      {l.name} (Ext {l.extension})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inbound Caller Number:</label>
                <input
                  type="text"
                  value={callerNumber}
                  onChange={(e) => setCallerNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleSimulateCall()}
              disabled={simulating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing SIP Packet Stream & Acoustic Forensics...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>Dispatch Inbound Telecom Call</span>
                </>
              )}
            </button>
          </div>

          {/* Autonomous Routing Result Banner */}
          {callResult && (
            <div className="space-y-5 animate-fadeIn">
              <div
                className={`rounded-2xl p-6 border transition-all ${
                  callResult.routing_decision === "ROUTE_TO_AGENT"
                    ? "glass-panel-safe border-emerald-500/50 cyber-glow-green"
                    : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                    ? "glass-panel border-amber-500/50"
                    : "glass-panel-danger border-rose-500/50 cyber-glow-red pulse-alert"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      callResult.routing_decision === "ROUTE_TO_AGENT"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
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
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-white border border-slate-800">
                        SIP {callResult.sip_response_code}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          callResult.routing_decision === "ROUTE_TO_AGENT"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {callResult.routing_decision}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {callResult.routing_decision === "ROUTE_TO_AGENT"
                        ? `Call Approved: Connected to Ext ${callResult.extension}`
                        : callResult.routing_decision === "DIVERT_TO_OTP_IVR"
                        ? `Suspicious Call Diverted to VoiceGuard Vocal OTP Challenge`
                        : `Call Terminated: Clone Intercepted & Blacklisted`}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {callResult.routing_reason}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                  <span>Call Reference: {callResult.call_id}</span>
                  <span>Risk Score: {callResult.risk_score.toFixed(1)}%</span>
                  <span
                    className={
                      callResult.blacklist_status === "GLOBAL_ENTERPRISE_BLACKLIST"
                        ? "text-rose-400 font-bold"
                        : "text-emerald-400 font-bold"
                    }
                  >
                    Blacklist: {callResult.blacklist_status}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">
                  Incident logged in SQLite Threat Ledger with SHA-256 evidence.
                </span>

                <div className="flex items-center space-x-3">
                  <Link
                    href="/soc"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center space-x-1"
                  >
                    <span>View in SOC Center</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link
                    href="/benchmark"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 flex items-center space-x-1"
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
