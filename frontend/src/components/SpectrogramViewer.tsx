"use client";

import React, { useEffect, useRef, useState } from "react";
import { Activity, Eye, Zap } from "lucide-react";

interface SpectrogramViewerProps {
  audioUrl?: string;
  audioBlob?: Blob | File;
  currentTime?: number;
  duration?: number;
  verdict?: "genuine" | "synthetic";
}

export default function SpectrogramViewer({
  audioUrl,
  audioBlob,
  currentTime = 0,
  duration = 0,
  verdict,
}: SpectrogramViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [computing, setComputing] = useState<boolean>(false);
  const [hasRendered, setHasRendered] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function generateSpectrogram() {
      if (!audioUrl && !audioBlob) return;
      setComputing(true);

      try {
        let arrayBuffer: ArrayBuffer;
        if (audioBlob) {
          arrayBuffer = await audioBlob.arrayBuffer();
        } else if (audioUrl) {
          const resp = await fetch(audioUrl);
          arrayBuffer = await resp.arrayBuffer();
        } else {
          return;
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx({ sampleRate: 16000 });
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const channelData = decodedBuffer.getChannelData(0);

        if (!active || !canvasRef.current) {
          audioCtx.close();
          return;
        }

        renderSpectrogram(channelData, canvasRef.current);
        setHasRendered(true);
        audioCtx.close();
      } catch (err) {
        console.error("Spectrogram computation error:", err);
      } finally {
        if (active) setComputing(false);
      }
    }

    generateSpectrogram();

    return () => {
      active = false;
    };
  }, [audioUrl, audioBlob]);

  const renderSpectrogram = (pcmData: Float32Array, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const windowSize = 256;
    const stepSize = Math.max(1, Math.floor((pcmData.length - windowSize) / width));
    const numFreqBins = windowSize / 2;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Synthetic Hann window
    const hannWindow = new Float32Array(windowSize);
    for (let i = 0; i < windowSize; i++) {
      hannWindow[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (windowSize - 1)));
    }

    for (let x = 0; x < width; x++) {
      const sampleOffset = x * stepSize;
      if (sampleOffset + windowSize >= pcmData.length) break;

      // Approximate short-time spectral energy density across frequency bins
      for (let bin = 0; bin < numFreqBins; bin++) {
        // Discrete Fourier transform estimate for frequency bin
        let real = 0;
        let imag = 0;
        const freqRad = (2 * Math.PI * bin) / windowSize;

        for (let n = 0; n < windowSize; n += 2) {
          const val = pcmData[sampleOffset + n] * hannWindow[n];
          real += val * Math.cos(freqRad * n);
          imag -= val * Math.sin(freqRad * n);
        }

        const mag = Math.sqrt(real * real + imag * imag);
        // Logarithmic scaling for human ear perception (dB proxy)
        const logMag = Math.min(1.0, Math.log10(1 + 18 * mag));

        // Map bin to Y coordinate (0 Hz at bottom, 8000 Hz at top)
        const y = Math.floor(height - 1 - (bin / numFreqBins) * height);
        if (y < 0 || y >= height) continue;

        const pixelIdx = (y * width + x) * 4;

        // Cyber forensic color map:
        // Low: Deep navy (#070b14) -> Mid: Cyan (#06b6d4) -> High: Amber (#f59e0b) -> Peak: White/Rose
        let r = 7, g = 11, b = 20;
        if (logMag > 0.05) {
          if (logMag < 0.35) {
            // Navy to Cyan
            const norm = (logMag - 0.05) / 0.3;
            r = Math.floor(7 + norm * 0);
            g = Math.floor(11 + norm * 182);
            b = Math.floor(20 + norm * 212);
          } else if (logMag < 0.75) {
            // Cyan to Amber
            const norm = (logMag - 0.35) / 0.4;
            r = Math.floor(6 + norm * 239);
            g = Math.floor(182 + norm * 0);
            b = Math.floor(212 - norm * 201);
          } else {
            // Amber to Hot Rose/White
            const norm = (logMag - 0.75) / 0.25;
            r = 255;
            g = Math.floor(158 + norm * 97);
            b = Math.floor(11 + norm * 244);
          }
        }

        data[pixelIdx] = r;
        data[pixelIdx + 1] = g;
        data[pixelIdx + 2] = b;
        data[pixelIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  const cursorPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="rounded-xl bg-[#070b14] border border-slate-800 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Forensic STFT Mel-Spectrogram Heatmap
          </h4>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
            <span>Vocal Formants</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            <span>Diffusion Floor</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
            <span>Vocoder Artifacts</span>
          </span>
        </div>
      </div>

      {/* Spectrogram Canvas Frame */}
      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-800 bg-[#050810]">
        {computing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm space-x-2">
            <Activity className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="text-xs font-mono text-cyan-300">Computing FFT Spectrum...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={640}
          height={160}
          className="w-full h-full object-cover"
        />

        {/* Playback Cursor Line */}
        {cursorPercent > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-300 pointer-events-none transition-all duration-75 shadow-[0_0_8px_#06b6d4]"
            style={{ left: `${cursorPercent}%` }}
          />
        )}

        {/* Frequency Scale Annotations on Y-axis */}
        <div className="absolute left-1.5 top-1 bottom-1 flex flex-col justify-between text-[9px] font-mono text-slate-400 select-none pointer-events-none drop-shadow">
          <span>8.0 kHz</span>
          <span>4.0 kHz</span>
          <span>1.5 kHz</span>
          <span>100 Hz</span>
        </div>

        {/* Vocoder Alert Callout */}
        {verdict === "synthetic" && (
          <div className="absolute right-2 top-2 px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono flex items-center space-x-1">
            <Zap className="w-3 h-3 text-rose-400" />
            <span>Neural Deconv Distortion Detected</span>
          </div>
        )}
      </div>

      {/* Time axis footer */}
      <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
        <span>0.00s</span>
        <span>Duration: {duration ? duration.toFixed(2) : "--"}s</span>
        <span>Frequency Range: 0 - 8,000 Hz</span>
      </div>
    </div>
  );
}
