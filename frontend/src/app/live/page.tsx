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
      const options = { mimeType: "audio/webm" };
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = mediaRecorder;

      let recordedChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      // Periodic slice
      const chunkInterval = setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 3500);

      mediaRecorder.onstop = async () => {
        if (recordedChunks.length > 0) {
          const chunkBlob = new Blob(recordedChunks, { type: "audio/webm" });
          recordedChunks = [];
          const idx = chunkIndexRef.current++;
          await handleSendChunk(chunkBlob, idx);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Failed to access microphone:", err);
      alert("Microphone access denied or audio device not found.");
    }
  };

  const handleSendChunk = async (chunkBlob: Blob, index: number) => {
    try {
      const res = await analyzeLiveChunk(chunkBlob, index, false);
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

      // Background pastel surface
      ctx.fillStyle = "#FBF7F4";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient color based on threat status
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (threatDetected) {
          gradient.addColorStop(0, "rgba(214, 57, 91, 0.2)");
          gradient.addColorStop(1, "rgba(214, 57, 91, 0.95)"); // Saturated crimson alert
        } else {
          gradient.addColorStop(0, "rgba(167, 216, 208, 0.4)");
          gradient.addColorStop(1, "rgba(184, 166, 232, 0.95)"); // Soft lavender / mint
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
    }, 1200);
  };

  const simulateFailChallenge = () => {
    setChallengePassed(false);
    setStatusLabel("🚨 Vocal Passphrase Failed: Terminating Session");
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-[#3A3450] animate-pulse" />
            <span>LIVE INTERACTIVE IN-CALL PROTECTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Live Call Shield Console
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Real-time microphone stream monitoring with sliding-window forensic neural risk scoring and automated step-up defense.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/demo-lab"
            className="px-4 py-2 rounded-xl bg-[#FCE4E4] border border-[#D6395B] hover:bg-[#F9D2D2] text-xs font-bold text-[#D6395B] transition-all flex items-center space-x-2 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D6395B]" />
            <span>Judge Demo Lab</span>
          </Link>
        </div>
      </div>

      {/* Critical Threat Alert Banner (Appears when AI Clone is detected) */}
      {threatDetected && (
        <div className="rounded-3xl p-6 sm:p-7 bg-[#FCE4E4] border-2 border-[#D6395B] shadow-md pulse-alert animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D6395B] text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-[#D6395B] text-white uppercase tracking-wider shadow-sm">
                    CRITICAL ATTACK INTERCEPT
                  </span>
                  <span className="text-xs font-mono text-[#D6395B] font-bold">
                    Risk Score: {currentRisk.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#D6395B] mt-1">
                  Synthetic AI Voice Clone Detected on Active Line
                </h3>
                <p className="text-xs text-[#3A3450] mt-1 font-medium">
                  Vocal tract resonance mismatch & neural vocoder high-frequency signature detected. Privileged action blocked.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-start md:self-auto">
              <button
                onClick={triggerChallenge}
                className="px-4 py-2.5 rounded-xl bg-[#C98A1F] hover:bg-[#B37817] text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-2"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span>Enforce Vocal OTP Challenge</span>
              </button>
              <button
                onClick={stopCall}
                className="px-4 py-2.5 rounded-xl bg-[#D6395B] hover:bg-[#BF2E4E] text-white font-bold text-xs transition-colors flex items-center space-x-2 shadow-sm"
              >
                <PhoneOff className="w-4 h-4 text-white" />
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
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isCalling
                      ? threatDetected
                        ? "bg-[#D6395B] animate-ping"
                        : "bg-[#2E9E5B] animate-pulse"
                      : "bg-[#7A7390]"
                  }`}
                />
                <div>
                  <h3 className="text-sm font-bold text-[#3A3450]">
                    Live Audio Stream Oscilloscope
                  </h3>
                  <p className="text-xs text-[#7A7390]">{statusLabel}</p>
                </div>
              </div>

              {isCalling && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF6F2] border border-[#E3DCF0] text-xs font-mono text-[#3A3450] font-bold shadow-sm">
                  <PhoneCall className="w-3.5 h-3.5 text-[#2E9E5B] animate-pulse" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
              )}
            </div>

            {/* Audio Wave Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E3DCF0] h-44 bg-[#FBF7F4] flex items-center justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={700}
                height={176}
                className="w-full h-full object-cover"
              />

              {!isCalling && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F3EEFB]/90 backdrop-blur-xs space-y-2">
                  <MicOff className="w-8 h-8 text-[#7A7390]" />
                  <p className="text-xs text-[#7A7390] font-medium">Microphone stream currently offline</p>
                  <button
                    onClick={startCall}
                    className="px-5 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4 text-[#3A3450]" />
                    <span>Initialize Call Shield</span>
                  </button>
                </div>
              )}
            </div>

            {/* Controls Row */}
            {isCalling && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs text-[#7A7390] font-mono">
                  <Activity className="w-4 h-4 text-[#8E79C9] animate-spin" />
                  <span>Sliding Window: 3.5s per forensic sample</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={stopCall}
                    className="px-4 py-2 rounded-xl bg-[#FCE4E4] hover:bg-[#F9D2D2] text-[#D6395B] border border-[#D6395B] text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <PhoneOff className="w-3.5 h-3.5 text-[#D6395B]" />
                    <span>Hang Up</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rolling Risk Score Chart — transitions from pastel teal to saturated crimson */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#3A3450] flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#8E79C9]" />
                  <span>Real-Time Rolling Risk Score</span>
                </h4>
                <p className="text-xs text-[#7A7390]">
                  Sliding temporal risk over the ongoing call duration.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono font-semibold">
                <span className="text-[#2E9E5B]">&lt;35% Authentic</span>
                <span className="text-[#D6395B]">&gt;65% Clone Alert</span>
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
                        stopColor={threatDetected || currentRisk > 65 ? "#D6395B" : "#B8A6E8"}
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor={threatDetected || currentRisk > 65 ? "#D6395B" : "#A7D8D0"}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#7A7390" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#7A7390" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#F3EEFB",
                      borderColor: "#E3DCF0",
                      borderRadius: "12px",
                      color: "#3A3450",
                      fontSize: "11px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    formatter={(v: any) => [`${v}%`, "Risk Score"]}
                  />
                  <ReferenceLine y={65} stroke="#D6395B" strokeDasharray="3 3" />
                  <ReferenceLine y={35} stroke="#2E9E5B" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke={threatDetected || currentRisk > 65 ? "#D6395B" : "#2E9E5B"}
                    strokeWidth={2.5}
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
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
            <span className="text-xs font-mono text-[#7A7390] uppercase tracking-wider font-semibold">
              Current Stream Threat Level
            </span>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/90 border border-[#E3DCF0] shadow-sm">
              <div
                className="text-5xl font-extrabold font-mono"
                style={{
                  color: currentRisk < 35 ? "#2E9E5B" : currentRisk <= 65 ? "#C98A1F" : "#D6395B",
                }}
              >
                {currentRisk.toFixed(1)}
                <span className="text-sm text-[#7A7390] font-normal">/100</span>
              </div>

              <span
                className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  currentRisk < 35
                    ? "bg-[#DFF5E6] text-[#2E9E5B] border-[#2E9E5B]"
                    : currentRisk <= 65
                    ? "bg-[#FDF3DA] text-[#C98A1F] border-[#C98A1F]"
                    : "bg-[#FCE4E4] text-[#D6395B] border-[#D6395B] animate-pulse"
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
              <div className="flex justify-between py-2 border-b border-[#E3DCF0]">
                <span className="text-[#7A7390]">Stream Status:</span>
                <span className={isCalling ? "text-[#2E9E5B] font-bold" : "text-[#7A7390]"}>
                  {isCalling ? "Live Active" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E3DCF0]">
                <span className="text-[#7A7390]">Chunks Scanned:</span>
                <span className="text-[#3A3450] font-bold">{timeSeries.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E3DCF0]">
                <span className="text-[#7A7390]">Sampling Rate:</span>
                <span className="text-[#3A3450]">16,000 Hz Mono</span>
              </div>
            </div>
          </div>

          {/* Step-Up Challenge Action Box */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#8E79C9]" />
              <h4 className="text-sm font-bold text-[#3A3450]">Vocal MFA Step-Up Challenge</h4>
            </div>
            <p className="text-xs text-[#7A7390] leading-relaxed">
              When suspicious vocal dynamics occur, prompt the caller with a dynamic random passphrase to defeat static AI playback.
            </p>

            <button
              onClick={triggerChallenge}
              className="w-full py-3 rounded-xl bg-[#EAF6F2] hover:bg-[#d6eee6] text-[#3A3450] border border-[#E3DCF0] text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#3A3450]" />
              <span>Simulate Vocal OTP Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vocal Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F3EEFB] border border-[#E3DCF0] rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E3DCF0] pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-[#C98A1F]" />
                <h3 className="text-base font-bold text-[#3A3450]">Vocal Step-Up Challenge</h3>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="text-[#7A7390] hover:text-[#3A3450] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7A7390] leading-relaxed">
              To verify human presence and defeat pre-recorded AI voice clone loops, ask the caller to vocalize this dynamic verification code immediately:
            </p>

            <div className="p-5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-[#7A7390] tracking-wider font-semibold">
                Dynamic Vocal Challenge PIN
              </span>
              <div className="text-3xl font-black font-mono tracking-widest text-[#7c63c7]">
                {challengeCode}
              </div>
              <span className="text-[11px] text-[#7A7390]">
                Expires in 45 seconds • Single-Use
              </span>
            </div>

            {challengePassed === true && (
              <div className="p-3.5 rounded-xl bg-[#DFF5E6] border border-[#2E9E5B] text-[#2E9E5B] text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verification Passed! Dynamic prosody and correct code confirmed.</span>
              </div>
            )}

            {challengePassed === false && (
              <div className="p-3.5 rounded-xl bg-[#FCE4E4] border border-[#D6395B] text-[#D6395B] text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Verification Failed! Attacker failed dynamic verbal challenge.</span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={simulatePassChallenge}
                className="flex-1 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#26854d] text-white font-bold text-xs transition-colors shadow-sm"
              >
                Simulate Pass (Human)
              </button>
              <button
                onClick={simulateFailChallenge}
                className="flex-1 py-2.5 rounded-xl bg-[#D6395B] hover:bg-[#bf2e4e] text-white font-bold text-xs transition-colors shadow-sm"
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
