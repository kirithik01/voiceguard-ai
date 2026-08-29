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
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="border-b border-[#E3DCF0] pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5 text-[#3A3450]" />
          <span>TECHNICAL SPECIFICATIONS & FORENSIC BLUEPRINT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3A3450] tracking-tight">
          System Architecture & Forensic Science
        </h1>
        <p className="text-sm text-[#7A7390] mt-2 max-w-3xl leading-relaxed">
          VoiceGuard AI is an enterprise defense pipeline architected to detect and prevent real-time voice cloning impersonation attacks across high-stakes banking, executive authorization, and call center voice channels.
        </p>
      </div>

      {/* 4-Layer Defense Architecture Breakdown */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-[#3A3450] flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#8E79C9]" />
          <span>4-Layer Multi-Stage Defense Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Layer 1 */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#7c63c7] px-2.5 py-0.5 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8]">
                LAYER 01
              </span>
              <span className="text-xs font-mono text-[#7A7390]">Audio Ingestion</span>
            </div>
            <h3 className="text-base font-bold text-[#3A3450]">
              Temporal Sliding Window & Resampling
            </h3>
            <p className="text-xs text-[#7A7390] leading-relaxed">
              Standardizes inbound microphone streams or uploaded files to 16,000 Hz single-channel float32 audio. Slices continuous speech into 4.0-second sliding windows with 1.0-second strides for continuous real-time forensic scanning.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#3a8b80] px-2.5 py-0.5 rounded-full bg-[#A7D8D0]/40 border border-[#A7D8D0]">
                LAYER 02
              </span>
              <span className="text-xs font-mono text-[#7A7390]">Acoustic Signal Processing</span>
            </div>
            <h3 className="text-base font-bold text-[#3A3450]">
              Acoustic Physics & Vocoder Forensics
            </h3>
            <p className="text-xs text-[#7A7390] leading-relaxed">
              Extracts fundamental pitch variability ($F_0$), STFT Wiener entropy, and spectral centroid dynamics. AI voice clones exhibit flatlined pitch variance ($F_0$ std dev &lt; 10 Hz) and elevated noise floors from neural vocoders.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#7c63c7] px-2.5 py-0.5 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8]">
                LAYER 03
              </span>
              <span className="text-xs font-mono text-[#7A7390]">Neural Classification</span>
            </div>
            <h3 className="text-base font-bold text-[#3A3450]">
              Dual-Engine Biometrics & Wav2Vec2
            </h3>
            <p className="text-xs text-[#7A7390] leading-relaxed">
              Passes speech chunks through self-supervised speech representations (Wav2Vec2) alongside speaker verification baselines. Distinguishes authentic humans from synthetic clones and impersonators.
            </p>
          </div>

          {/* Layer 4 */}
          <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#2E9E5B] px-2.5 py-0.5 rounded-full bg-[#DFF5E6] border border-[#2E9E5B]">
                LAYER 04
              </span>
              <span className="text-xs font-mono text-[#7A7390]">Automated Mitigation</span>
            </div>
            <h3 className="text-base font-bold text-[#3A3450]">
              Dynamic Vocal OTP & PBX Intercept
            </h3>
            <p className="text-xs text-[#7A7390] leading-relaxed">
              When risk score exceeds 65%, VoiceGuard executes autonomous mitigation: prompts caller with dynamic randomized challenge PINs, executes SIP 403 disconnects, and signs Section 65B legal dossiers.
            </p>
          </div>
        </div>
      </section>

      {/* Forensic Detection Principles Explained */}
      <section className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-8 border border-[#E3DCF0] space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#3A3450]">
          Forensic Acoustic Science Explained
        </h3>

        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] space-y-1.5 shadow-xs">
            <h4 className="font-bold text-[#3A3450] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c63c7]" />
              <span>1. Pitch Dynamics ($F_0$) & Biological Micro-Prosody</span>
            </h4>
            <p className="text-[#7A7390] pl-4.5">
              Human vocal cords oscillate with natural biological irregularity, breathing shifts, and emotional micro-intonation ($F_0$ standard deviation typically 25 to 60+ Hz). Synthesized voice clones often exhibit unnaturally uniform pitch contours ($F_0$ std dev &lt; 10 Hz) or synthetic micro-tremor glitches.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] space-y-1.5 shadow-xs">
            <h4 className="font-bold text-[#3A3450] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3a8b80]" />
              <span>2. Wiener Entropy (Spectral Flatness) Anomaly</span>
            </h4>
            <p className="text-[#7A7390] pl-4.5">
              Wiener entropy evaluates the ratio between geometric mean and arithmetic mean of the power spectrum. Human speech produces distinct vocal tract formant resonance peaks with low spectral flatness. Neural vocoders synthesizing speech from mel-spectrograms create elevated white-noise floors in high frequencies (&gt;0.035).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] space-y-1.5 shadow-xs">
            <h4 className="font-bold text-[#3A3450] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C98A1F]" />
              <span>3. Phase Discontinuity & Vocoder Artifacts</span>
            </h4>
            <p className="text-[#7A7390] pl-4.5">
              Because neural vocoders invert magnitude spectrograms into waveforms, phase alignment across frame boundaries is imperfect. VoiceGuard analyzes high-order harmonic ratios and zero-crossing distributions to detect these phase incoherences.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#3A3450] flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#8E79C9]" />
          <span>Full-Stack Engineering Stack</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
            <span className="text-[#7A7390] uppercase font-semibold">Frontend Framework</span>
            <div className="text-[#3A3450] font-bold font-sans">Next.js 16 (App Router)</div>
            <p className="text-[11px] text-[#7A7390]">React 19 & Turbopack</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
            <span className="text-[#7A7390] uppercase font-semibold">Styling & UI</span>
            <div className="text-[#3A3450] font-bold font-sans">Tailwind CSS v4</div>
            <p className="text-[11px] text-[#7A7390]">Pastel Theme & Lucide</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
            <span className="text-[#7A7390] uppercase font-semibold">Backend Server</span>
            <div className="text-[#3A3450] font-bold font-sans">FastAPI & Python 3.11</div>
            <p className="text-[11px] text-[#7A7390]">Async REST Engine</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F3EEFB] border border-[#E3DCF0] space-y-1 shadow-sm">
            <span className="text-[#7A7390] uppercase font-semibold">Audio & ML Engine</span>
            <div className="text-[#3A3450] font-bold font-sans">Librosa & PyTorch</div>
            <p className="text-[11px] text-[#7A7390]">SoundFile & SciPy</p>
          </div>
        </div>
      </section>

      {/* Quick Navigation Footer */}
      <div className="pt-6 flex flex-wrap gap-4 border-t border-[#E3DCF0]">
        <Link
          href="/live"
          className="px-5 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs shadow-sm transition-all flex items-center space-x-2"
        >
          <Radio className="w-4 h-4" />
          <span>Launch Live Call Shield</span>
        </Link>
        <Link
          href="/demo-lab"
          className="px-5 py-2.5 rounded-xl bg-[#FCE4E4] hover:bg-[#F9D2D2] text-[#D6395B] border border-[#D6395B] font-bold text-xs transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Zap className="w-4 h-4 text-[#D6395B]" />
          <span>Try Judge Demo Lab</span>
        </Link>
      </div>
    </div>
  );
}
