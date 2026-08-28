"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Shield,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileCheck,
  Radio,
  Fingerprint,
  PhoneForwarded,
  Sliders,
  Sparkles,
  ExternalLink,
  Code2
} from "lucide-react";

export default function PitchPage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const pillars = [
    {
      num: "01",
      title: "Mathematical Acoustic Physics Core",
      subtitle: "Autocorrelation F0 Tracking & STFT Wiener Entropy",
      description:
        "Extracts fundamental physiological voice markers. Neural vocoders (HiFi-GAN, MelGAN) inherently suffer from unnatural pitch curve flatlining (pitch std < 10 Hz) and elevated diffusion noise floors.",
      tag: "CORE FORENSICS"
    },
    {
      num: "02",
      title: "Real-Time In-Line Live Call Shield",
      subtitle: "<150ms Temporal Sliding Windows & Dynamic Vocal OTP",
      description:
        "Captures streaming microphone audio via Web Audio API, slices into 3.5s overlapping windows, and triggers interactive Step-Up Vocal Challenge PINs when synthetic anomalies emerge.",
      tag: "REAL-TIME DEFENSE"
    },
    {
      num: "03",
      title: "Dual-Engine Biometric Voiceprint Verification",
      subtitle: "Anti-Spoofing Liveness + 8-Band Formant Resonance",
      description:
        "Simultaneously tests: (1) Is this voice an AI clone? AND (2) Is this caller who they claim to be? Matches against enrolled authorized executive baselines.",
      tag: "BIOMETRIC IDENTITY"
    },
    {
      num: "04",
      title: "Cryptographic Audio Watermarking (Prevention)",
      subtitle: "Inaudible Spread-Spectrum Ultrasonic Provenance",
      description:
        "Fulfills the Prevention mandate by embedding an imperceptible acoustic signature (7.2 - 7.8 kHz) into authorized corporate audio before release. Instant proof of origin.",
      tag: "ATTACK PREVENTION"
    },
    {
      num: "05",
      title: "Autonomous Telephony PBX Switchboard Interceptor",
      subtitle: "SIP 200 / 302 / 403 In-Line Decision Engine",
      description:
        "Integrates directly into enterprise telecom lines (Twilio, Asterisk, FreePBX). Automatically routes clean audio, diverts suspicious calls to IVR, and terminates/blacklists clones.",
      tag: "TELECOM INFRASTRUCTURE"
    },
    {
      num: "06",
      title: "Regulatory Compliance & Court Dossiers",
      subtitle: "Indian IT Act Sec 66D & Evidence Act Sec 65B",
      description:
        "Automatically outputs SHA-256 evidence chain-of-custody checksums and printable court-admissible forensic dossiers standardizing CERT-In and RBI cyber fraud guidelines.",
      tag: "LEGAL COMPLIANCE"
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn max-w-6xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>HACKATHON JURY EVALUATION CONSOLE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          VoiceGuard AI Defense Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          The next-generation autonomous enterprise platform engineered to detect, intercept, and prevent neural voice cloning and executive impersonation attacks.
        </p>
      </div>

      {/* Problem vs Solution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel-danger rounded-2xl p-6 border border-rose-500/40 space-y-3">
          <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
            The Critical Challenge
          </span>
          <h3 className="text-lg font-bold text-white">
            Generative AI Voice Cloning Weaponization
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Off-the-shelf generative voice tools (ElevenLabs, Bark, Tortoise, Edge-TTS) require only 3 seconds of reference audio to clone any CEO or officer with 95%+ perceived similarity, costing enterprises billions annually via unauthorized wire transfers and helpdesk MFA resets.
          </p>
        </div>

        <div className="glass-panel-safe rounded-2xl p-6 border border-emerald-500/40 space-y-3">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            The VoiceGuard Breakthrough
          </span>
          <h3 className="text-lg font-bold text-white">
            Physics-Grounded Defense-in-Depth
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rather than relying on brittle black-box models, VoiceGuard exploits the mathematical limits of neural vocoders: pitch flatlining, spectral flatness diffusion noise, and vocal tract formant mismatches, delivering sub-150ms in-line interception across telephony and WebRTC.
          </p>
        </div>
      </div>

      {/* The 6 Pillars Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">
            The 6-Pillar Defense-in-Depth Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Engineered to cover the complete attack lifecycle: from source prevention to court testimony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div
              key={p.num}
              className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-cyan-400/40 group-hover:text-cyan-400 transition-colors">
                  {p.num}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {p.tag}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{p.title}</h4>
              <p className="text-xs font-mono text-cyan-300/80">{p.subtitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Benchmark Comparison Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Competitive Defense Benchmark</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How VoiceGuard AI compares against traditional heuristics and legacy solutions.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Feature / Capability</th>
                <th className="py-3 px-4 text-cyan-400 font-bold">VoiceGuard AI (Ours)</th>
                <th className="py-3 px-4 text-slate-400">Basic MFCC Classifiers</th>
                <th className="py-3 px-4 text-slate-400">Legacy Telecom Gateways</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/40">
              <tr>
                <td className="py-3 px-4 text-white font-sans font-semibold">
                  Detection Speed (Latency)
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">&lt; 150 ms (Real-time)</td>
                <td className="py-3 px-4 text-slate-400">1 - 3 seconds</td>
                <td className="py-3 px-4 text-slate-400">Post-call batch log</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white font-sans font-semibold">
                  Dual-Engine Identity (Who is calling?)
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (Formant Biometrics)</td>
                <td className="py-3 px-4 text-rose-400">No (Spoof score only)</td>
                <td className="py-3 px-4 text-slate-400">Caller ID metadata only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white font-sans font-semibold">
                  Source Attack Prevention
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (Acoustic Watermarking)</td>
                <td className="py-3 px-4 text-rose-400">None</td>
                <td className="py-3 px-4 text-rose-400">None</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white font-sans font-semibold">
                  Telephony PBX In-Line Routing
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">SIP 200/302/403 Autonomous</td>
                <td className="py-3 px-4 text-rose-400">Manual API</td>
                <td className="py-3 px-4 text-slate-400">Simple DTMF IVR</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white font-sans font-semibold">
                  Robustness to 8kHz Phone Lines
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Enterprise Grade (G.711 Benchmarked)</td>
                <td className="py-3 px-4 text-rose-400">High False Positives</td>
                <td className="py-3 px-4 text-slate-400">N/A</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white font-sans font-semibold">
                  Court-Admissible Legal Dossiers
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (Sec 65B & Sec 66D SHA-256)</td>
                <td className="py-3 px-4 text-rose-400">None</td>
                <td className="py-3 px-4 text-slate-400">Raw CDR logs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 1-Click Interactive Guided Demo Showcase */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Interactive 4-Step Hackathon Demonstration Guide</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Follow this 1-click sequence to demonstrate the entire VoiceGuard ecosystem during pitch time:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/demo-lab"
            className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all space-y-2 group"
          >
            <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 1</span>
            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
              Demo Lab & Clone Generator
            </h4>
            <p className="text-[11px] text-slate-400">
              Synthesize an AI clone in real-time and watch VoiceGuard flag it with 95%+ confidence.
            </p>
          </Link>

          <Link
            href="/live"
            className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all space-y-2 group"
          >
            <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 2</span>
            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
              Live Microphone Shield
            </h4>
            <p className="text-[11px] text-slate-400">
              Speak into the microphone: verify continuous rolling risk score and Vocal OTP challenge.
            </p>
          </Link>

          <Link
            href="/voiceprint"
            className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all space-y-2 group"
          >
            <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 3</span>
            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
              Dual-Engine Biometrics
            </h4>
            <p className="text-[11px] text-slate-400">
              Test enrolled CEO Rajesh Verma against genuine voice vs synthetic wire fraud clone.
            </p>
          </Link>

          <Link
            href="/war-room"
            className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all space-y-2 group"
          >
            <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 4</span>
            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
              Telephony War Room
            </h4>
            <p className="text-[11px] text-slate-400">
              Simulate an inbound PBX attack and watch autonomous SIP 403 Disconnect and Blacklisting.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
