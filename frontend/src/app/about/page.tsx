"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Database,
  Radio,
  Lock,
  ArrowRight,
  ExternalLink,
  Zap,
  Terminal,
  Fingerprint
} from "lucide-react";

export default function AboutArchitecturePage() {
  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>TECHNICAL SPECIFICATIONS & FORENSIC BLUEPRINT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          System Architecture & Forensic Science
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          VoiceGuard AI is an enterprise defense pipeline architected to detect and prevent real-time voice cloning impersonation attacks across high-stakes banking, executive authorization, and call center voice channels.
        </p>
      </div>

      {/* 4-Layer Defense Architecture Breakdown */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>4-Layer Multi-Stage Defense Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Layer 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                LAYER 01
              </span>
              <span className="text-xs font-mono text-slate-500">Audio Ingestion</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Temporal Sliding Window & Resampling
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standardizes inbound microphone streams or uploaded files to 16,000 Hz single-channel float32 audio. Slices continuous speech into 4.0-second sliding windows with 1.0-second strides for continuous real-time forensic scanning.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                LAYER 02
              </span>
              <span className="text-xs font-mono text-slate-500">Signal Processing</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Acoustic & Prosodic Forensics
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Extracts fundamental frequency ($F_0$) dynamics using autocorrelation pitch tracking, Short-Time Fourier Transform (STFT) Wiener entropy / spectral flatness, zero-crossing rate (ZCR), and spectral centroid distributions.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                LAYER 03
              </span>
              <span className="text-xs font-mono text-slate-500">Neural Detection</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Neural Vocoder Artifact Detection
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects high-frequency harmonic loss, phase discontinuities, and periodic deconvolutional buzz artifacts characteristic of modern neural vocoders (HiFi-GAN, MelGAN, WaveGlow, ElevenLabs, VITS).
            </p>
          </div>

          {/* Layer 4 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                LAYER 04
              </span>
              <span className="text-xs font-mono text-slate-500">Threat Mitigation</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Automated Policy Enforcement & Step-Up MFA
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If risk score exceeds threshold (&gt;65%), triggers active mitigation: automatically halts transaction authorization, dispatches SOC incident alert, logs audit trail into SQLite, and issues dynamic vocal challenge PINs.
            </p>
          </div>
        </div>
      </section>

      {/* Forensic Science Deep-Dive */}
      <section className="glass-panel rounded-2xl p-7 border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Fingerprint className="w-5 h-5 text-cyan-400" />
          <span>The Science: Why AI Voice Clones Fail Forensic Inspection</span>
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>1. Pitch Dynamics ($F_0$) & Biological Micro-Prosody</span>
            </h4>
            <p className="text-slate-400 pl-4">
              Human vocal cords oscillate with natural biological irregularity, breathing shifts, and emotional micro-intonation ($F_0$ standard deviation typically 25 to 60+ Hz). Synthesized voice clones often exhibit unnaturally uniform pitch contours ($F_0$ std dev &lt; 10 Hz) or synthetic micro-tremor glitches.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>2. Wiener Entropy (Spectral Flatness) Anomaly</span>
            </h4>
            <p className="text-slate-400 pl-4">
              Wiener entropy evaluates the ratio between geometric mean and arithmetic mean of the power spectrum. Human speech produces distinct vocal tract formant resonance peaks with low spectral flatness. Neural vocoders synthesizing speech from mel-spectrograms create elevated white-noise floors in high frequencies (&gt;0.035).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>3. Phase Discontinuity & Vocoder Artifacts</span>
            </h4>
            <p className="text-slate-400 pl-4">
              Because neural vocoders invert magnitude spectrograms into waveforms, phase alignment across frame boundaries is imperfect. VoiceGuard analyzes high-order harmonic ratios and zero-crossing distributions to detect these phase incoherences.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>Full-Stack Engineering Stack</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase">Frontend Framework</span>
            <div className="text-white font-bold font-sans">Next.js 16 (App Router)</div>
            <p className="text-[11px] text-slate-400">React 19 & Turbopack</p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase">Styling & UI</span>
            <div className="text-white font-bold font-sans">Tailwind CSS v4</div>
            <p className="text-[11px] text-slate-400">Glassmorphism & Lucide</p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase">Backend Server</span>
            <div className="text-white font-bold font-sans">FastAPI & Python 3.11</div>
            <p className="text-[11px] text-slate-400">Async REST Engine</p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase">Audio & ML Engine</span>
            <div className="text-white font-bold font-sans">Librosa & PyTorch</div>
            <p className="text-[11px] text-slate-400">SoundFile & SciPy</p>
          </div>
        </div>
      </section>

      {/* Quick Navigation Footer */}
      <div className="pt-6 flex flex-wrap gap-4 border-t border-slate-800">
        <Link
          href="/live"
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
        >
          <Radio className="w-4 h-4" />
          <span>Launch Live Call Shield</span>
        </Link>
        <Link
          href="/demo-lab"
          className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors flex items-center space-x-2"
        >
          <Zap className="w-4 h-4 text-rose-400" />
          <span>Try Judge Demo Lab</span>
        </Link>
      </div>
    </div>
  );
}
