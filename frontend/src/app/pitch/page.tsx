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
      title: "Telecom PBX In-Line Proxy & Autonomous SIP Routing",
      subtitle: "G.711 Benchmarked + SIP 200/302/403 Decisioning",
      description:
        "Acts as an active SIP proxy switchboard. Analyzes telecom RTP voice packets before call bridge completes. Automatically diverts suspicious callers or returns SIP 403 Forbidden.",
      tag: "TELECOM GATEWAY"
    },
    {
      num: "06",
      title: "Court-Admissible Electronic Evidence (Section 65B)",
      subtitle: "Indian IT Act Sec 66D + SHA-256 Chain of Custody",
      description:
        "Generates formal court-ready case dossiers complete with SHA-256 evidence digests, statutory penal citations, and immutable chain-of-custody tracking for law enforcement submission.",
      tag: "LEGAL ENFORCEMENT"
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Award className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>HACKATHON JURY EVALUATION & ARCHITECTURE CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            VoiceGuard AI — Defense Architecture & Jury Pitch
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Enterprise voice cloning defense engineered to satisfy all detection, prevention, and forensic integrity criteria.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/demo-lab"
            className="px-4 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Judge Demo Lab</span>
          </Link>
        </div>
      </div>

      {/* 6 Core Defense Pillars Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#8E79C9]" />
          <span>The 6 Pillars of VoiceGuard Defense Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <div
              key={p.num}
              className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 flex flex-col justify-between shadow-sm hover:border-[#B8A6E8] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-[#7c63c7]">{p.num}</span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B8A6E8]/30 text-[#3A3450] border border-[#B8A6E8]">
                    {p.tag}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#3A3450]">{p.title}</h3>
                <p className="text-xs text-[#7c63c7] font-mono font-semibold">{p.subtitle}</p>
              </div>

              <p className="text-xs text-[#7A7390] leading-relaxed pt-2 border-t border-[#E3DCF0]">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Benchmark Comparison Table */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#C98A1F]" />
            <span>Competitive Defense Benchmark</span>
          </h3>
          <p className="text-xs text-[#7A7390] mt-0.5">
            How VoiceGuard AI compares against traditional heuristics and legacy solutions.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E3DCF0]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F3EEFB] text-[#7A7390] uppercase tracking-wider border-b border-[#E3DCF0]">
              <tr>
                <th className="py-3 px-4 font-bold">Feature / Capability</th>
                <th className="py-3 px-4 text-[#2E9E5B] font-extrabold">VoiceGuard AI (Ours)</th>
                <th className="py-3 px-4 text-[#7A7390] font-semibold">Basic MFCC Classifiers</th>
                <th className="py-3 px-4 text-[#7A7390] font-semibold">Legacy Telecom Gateways</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DCF0] bg-[#FBF7F4]">
              <tr>
                <td className="py-3 px-4 text-[#3A3450] font-sans font-bold">
                  Detection Speed (Latency)
                </td>
                <td className="py-3 px-4 text-[#2E9E5B] font-extrabold">&lt; 150 ms (Real-time)</td>
                <td className="py-3 px-4 text-[#7A7390]">1 - 3 seconds</td>
                <td className="py-3 px-4 text-[#7A7390]">Post-call batch log</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-[#3A3450] font-sans font-bold">
                  Dual-Engine Identity (Who is calling?)
                </td>
                <td className="py-3 px-4 text-[#2E9E5B] font-extrabold">Yes (Formant Biometrics)</td>
                <td className="py-3 px-4 text-[#D6395B] font-bold">No (Spoof score only)</td>
                <td className="py-3 px-4 text-[#7A7390]">Caller ID metadata only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-[#3A3450] font-sans font-bold">
                  Source Attack Prevention
                </td>
                <td className="py-3 px-4 text-[#2E9E5B] font-extrabold">Yes (Acoustic Watermarking)</td>
                <td className="py-3 px-4 text-[#D6395B] font-bold">None</td>
                <td className="py-3 px-4 text-[#D6395B] font-bold">None</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-[#3A3450] font-sans font-bold">
                  Telephony PBX In-Line Routing
                </td>
                <td className="py-3 px-4 text-[#2E9E5B] font-extrabold">SIP 200/302/403 Autonomous</td>
                <td className="py-3 px-4 text-[#D6395B] font-bold">Manual API</td>
                <td className="py-3 px-4 text-[#7A7390]">Simple DTMF IVR</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-[#3A3450] font-sans font-bold">
                  Robustness to 8kHz Phone Lines
                </td>
                <td className="py-3 px-4 text-[#2E9E5B] font-extrabold">Enterprise Grade (G.711 Benchmarked)</td>
                <td className="py-3 px-4 text-[#D6395B] font-bold">High False Positives</td>
                <td className="py-3 px-4 text-[#7A7390]">N/A</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-[#3A3450] font-sans font-bold">
                  Court-Admissible Legal Dossiers
                </td>
                <td className="py-3 px-4 text-[#2E9E5B] font-extrabold">Yes (Sec 65B & Sec 66D SHA-256)</td>
                <td className="py-3 px-4 text-[#D6395B] font-bold">None</td>
                <td className="py-3 px-4 text-[#7A7390]">Raw CDR logs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 1-Click Interactive Guided Demo Showcase */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-5 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-[#3A3450] flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#8E79C9]" />
            <span>Interactive 4-Step Hackathon Demonstration Guide</span>
          </h3>
          <p className="text-xs text-[#7A7390] mt-1">
            Follow this 1-click sequence to demonstrate the entire VoiceGuard ecosystem during pitch time:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/demo-lab"
            className="p-5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] hover:border-[#B8A6E8] transition-all space-y-2 group shadow-xs hover:-translate-y-0.5"
          >
            <span className="text-[10px] font-mono text-[#7c63c7] font-bold">STEP 1</span>
            <h4 className="text-xs font-bold text-[#3A3450] group-hover:text-[#7c63c7]">
              Demo Lab & Clone Generator
            </h4>
            <p className="text-[11px] text-[#7A7390]">
              Synthesize an AI clone in real-time and watch VoiceGuard flag it with 95%+ confidence.
            </p>
          </Link>

          <Link
            href="/live"
            className="p-5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] hover:border-[#B8A6E8] transition-all space-y-2 group shadow-xs hover:-translate-y-0.5"
          >
            <span className="text-[10px] font-mono text-[#7c63c7] font-bold">STEP 2</span>
            <h4 className="text-xs font-bold text-[#3A3450] group-hover:text-[#7c63c7]">
              Live Microphone Shield
            </h4>
            <p className="text-[11px] text-[#7A7390]">
              Speak into the microphone: verify continuous rolling risk score and Vocal OTP challenge.
            </p>
          </Link>

          <Link
            href="/voiceprint"
            className="p-5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] hover:border-[#B8A6E8] transition-all space-y-2 group shadow-xs hover:-translate-y-0.5"
          >
            <span className="text-[10px] font-mono text-[#7c63c7] font-bold">STEP 3</span>
            <h4 className="text-xs font-bold text-[#3A3450] group-hover:text-[#7c63c7]">
              Dual-Engine Biometrics
            </h4>
            <p className="text-[11px] text-[#7A7390]">
              Test enrolled CEO Rajesh Verma against genuine voice vs synthetic wire fraud clone.
            </p>
          </Link>

          <Link
            href="/war-room"
            className="p-5 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] hover:border-[#B8A6E8] transition-all space-y-2 group shadow-xs hover:-translate-y-0.5"
          >
            <span className="text-[10px] font-mono text-[#7c63c7] font-bold">STEP 4</span>
            <h4 className="text-xs font-bold text-[#3A3450] group-hover:text-[#7c63c7]">
              Telephony War Room
            </h4>
            <p className="text-[11px] text-[#7A7390]">
              Simulate an inbound PBX attack and watch autonomous SIP 403 Disconnect and Blacklisting.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
