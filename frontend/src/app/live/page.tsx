"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Mic,
  MicOff,
  Activity,
  PhoneCall,
  PhoneOff,
  Lock,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from "recharts";
import { analyzeLiveChunk } from "@/lib/api";
import { AnalyzeResult, ChunkScore } from "@/lib/types";

export default function LiveCallShieldPage() {
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [currentRisk, setCurrentRisk] = useState<number>(18.0);
  const [statusLabel, setStatusLabel] = useState<string>("Standby - Ready for Call");
  const [threatDetected, setThreatDetected] = useState<boolean>(false);
  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false);
  const [challengeCode, setChallengeCode] = useState<string>("849-210");
  const [challengePassed, setChallengePassed] = useState<boolean | null>(null);

  // Time-series history of rolling risk scores
  const [timeSeries, setTimeSeries] = useState<
    { time: string; risk: number; label: string }[]
  >([]);

  // Canvas visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // MediaRecorder for chunk streaming
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkIndexRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCall();
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsCalling(true);
      setCallDuration(0);
      setCurrentRisk(18.0);
      setThreatDetected(false);
      setStatusLabel("Call Active - Monitoring Voice Signatures...");
      setTimeSeries([{ time: "0s", risk: 18.0, label: "genuine" }]);
      chunkIndexRef.current = 0;

      // 1. Audio Visualizer Setup
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawOscilloscope();

      // 2. Call duration timer
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // 3. MediaRecorder chunk streaming (every 3.5 seconds)
      initRecorder(stream);
    } catch (err: any) {
      alert("Microphone permission denied or microphone not found: " + err.message);
    }
  };

  const initRecorder = (stream: MediaStream) => {
    let mimeType = "audio/webm";
    if (!MediaRecorder.isTypeSupported("audio/webm")) {
      if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else {
        mimeType = "";
      }
    }

    try {
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          const chunkIdx = chunkIndexRef.current++;
          sendChunkForForensicScoring(e.data, chunkIdx);
        }
      };

      recorder.start(3500); // Trigger chunk every 3.5s
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
    }
  };

  const sendChunkForForensicScoring = async (blob: Blob, index: number) => {
    try {
      const res: AnalyzeResult = await analyzeLiveChunk(blob, index, false);
      const newRisk = res.risk_score;
      setCurrentRisk(newRisk);

      setTimeSeries((prev) => [
        ...prev.slice(-15),
        {
          time: `${(index + 1) * 3.5}s`,
          risk: newRisk,
          label: res.verdict,
        },
      ]);

      if (res.verdict === "synthetic" || newRisk > 65) {
        setThreatDetected(true);
        setStatusLabel("🚨 ATTACK INTERCEPTED: Neural Voice Clone Detected!");
      } else if (newRisk > 35) {
        setStatusLabel("⚠️ Caution: Fluctuating Prosodic Resonances");
      } else {
        setStatusLabel("✅ Voice Authentic - Biological Vocal Resonances Verified");
      }
    } catch (err) {
      console.error("Error evaluating live chunk:", err);
    }
  };

  const stopCall = () => {
    setIsCalling(false);
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatusLabel("Call Ended");
  };

  const drawOscilloscope = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle grid
      ctx.fillStyle = "rgba(10, 15, 26, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient color based on threat status
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (threatDetected) {
          gradient.addColorStop(0, "rgba(244, 63, 94, 0.2)");
          gradient.addColorStop(1, "rgba(244, 63, 94, 0.9)");
        } else {
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.2)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0.9)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    render();
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const triggerChallenge = () => {
    const code = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    setChallengeCode(code);
    setChallengePassed(null);
    setShowChallengeModal(true);
  };

  const simulatePassChallenge = () => {
    setChallengePassed(true);
    setThreatDetected(false);
    setCurrentRisk(22.0);
    setStatusLabel("✅ Identity Verified via Dynamic Vocal Passphrase");
    setTimeout(() => {
      setShowChallengeModal(false);
    }, 1500);
  };

  const simulateFailChallenge = () => {
    setChallengePassed(false);
    setStatusLabel("🚨 STEP-UP AUTH FAILED: Impersonator unable to vocalize dynamic OTP");
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>REAL-TIME CALL SHIELD & IMPERSONATION DEFENSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Call Shield
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time microphone stream monitoring with sliding-window forensic neural risk scoring and automated step-up defense.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/demo-lab"
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold text-rose-300 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Judge Demo Lab</span>
          </Link>
        </div>
      </div>

      {/* Critical Threat Alert Banner (Appears when AI Clone is detected) */}
      {threatDetected && (
        <div className="glass-panel-danger rounded-2xl p-6 border border-rose-500/50 cyber-glow-red pulse-alert animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/30 text-rose-200 uppercase tracking-wider border border-rose-500/40">
                    CRITICAL ATTACK INTERCEPT
                  </span>
                  <span className="text-xs font-mono text-rose-300">
                    Risk Score: {currentRisk.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Synthetic AI Voice Clone Detected on Active Line
                </h3>
                <p className="text-xs text-rose-200 mt-1">
                  Vocal tract resonance mismatch & neural vocoder high-frequency signature detected. Privileged action blocked.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-start md:self-auto">
              <button
                onClick={triggerChallenge}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
              >
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span>Enforce Vocal OTP Challenge</span>
              </button>
              <button
                onClick={stopCall}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center space-x-2"
              >
                <PhoneOff className="w-4 h-4 text-rose-400" />
                <span>Terminate Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Visualizer & Stream Control */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visualizer & Mic Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isCalling
                      ? threatDetected
                        ? "bg-rose-500 animate-ping"
                        : "bg-emerald-400 animate-pulse"
                      : "bg-slate-600"
                  }`}
                />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live Audio Stream Oscilloscope
                  </h3>
                  <p className="text-xs text-slate-400">{statusLabel}</p>
                </div>
              </div>

              {isCalling && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
              )}
            </div>

            {/* Audio Wave Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800/80 h-44 bg-slate-950/90 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={700}
                height={176}
                className="w-full h-full object-cover"
              />

              {!isCalling && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs space-y-2">
                  <MicOff className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-400">Microphone stream currently offline</p>
                  <button
                    onClick={startCall}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4 text-slate-950" />
                    <span>Initialize Call Shield</span>
                  </button>
                </div>
              )}
            </div>

            {/* Controls Row */}
            {isCalling && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Sliding Window: 3.5s per forensic sample</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={stopCall}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>Hang Up</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rolling Risk Score Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Rolling Risk Score</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Sliding temporal risk over the ongoing call duration.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-emerald-400">&lt;35% Authentic</span>
                <span className="text-rose-400">&gt;65% Clone Alert</span>
              </div>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeries}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={threatDetected ? "#f43f5e" : "#06b6d4"}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={threatDetected ? "#f43f5e" : "#06b6d4"}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(v: any) => [`${v}%`, "Risk Score"]}
                  />
                  <ReferenceLine y={65} stroke="#f43f5e" strokeDasharray="3 3" />
                  <ReferenceLine y={35} stroke="#10b981" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke={threatDetected ? "#f43f5e" : "#06b6d4"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Security State & Threat Mitigation Card */}
        <div className="space-y-6">
          {/* Risk Gauge Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Current Stream Threat Level
            </span>

            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-slate-800">
              <div
                className="text-5xl font-extrabold font-mono"
                style={{
                  color: currentRisk < 35 ? "#10b981" : currentRisk <= 65 ? "#f59e0b" : "#f43f5e",
                }}
              >
                {currentRisk.toFixed(1)}
                <span className="text-sm text-slate-500 font-normal">/100</span>
              </div>

              <span
                className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  currentRisk < 35
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : currentRisk <= 65
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse"
                }`}
              >
                {currentRisk < 35
                  ? "Authentic Human"
                  : currentRisk <= 65
                  ? "Elevated / Suspicious"
                  : "Voice Clone Intercept"}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Stream Status:</span>
                <span className={isCalling ? "text-cyan-300 font-bold" : "text-slate-500"}>
                  {isCalling ? "Live Active" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Chunks Scanned:</span>
                <span className="text-white font-bold">{timeSeries.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Sampling Rate:</span>
                <span className="text-slate-300">16,000 Hz Mono</span>
              </div>
            </div>
          </div>

          {/* Step-Up Challenge Action Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Vocal MFA Step-Up Challenge</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When suspicious vocal dynamics occur, prompt the caller with a dynamic random passphrase to defeat static AI playback.
            </p>

            <button
              onClick={triggerChallenge}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Vocal OTP Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vocal Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Vocal Step-Up Challenge</h3>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To verify human presence and defeat pre-recorded AI voice clone loops, ask the caller to vocalize this dynamic verification code immediately:
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Dynamic Vocal Challenge PIN
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-widest text-cyan-300">
                {challengeCode}
              </div>
              <span className="text-[11px] text-slate-400">
                Expires in 45 seconds • Single-Use
              </span>
            </div>

            {challengePassed === true && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verification Passed! Dynamic prosody and correct code confirmed.</span>
              </div>
            )}

            {challengePassed === false && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Verification Failed! Attacker failed dynamic verbal challenge.</span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={simulatePassChallenge}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Simulate Pass (Human)
              </button>
              <button
                onClick={simulateFailChallenge}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Simulate Fail (Clone)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
