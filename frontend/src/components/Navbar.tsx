"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Radio, Upload, History, Info, Activity, AlertTriangle, Fingerprint, ShieldAlert, Sliders, PhoneForwarded, Cpu, Globe, Award, Code2, Languages, ShieldMinus } from "lucide-react";
import { checkHealth } from "@/lib/api";
import { HealthResponse } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const probeHealth = async () => {
      const start = performance.now();
      try {
        const data = await checkHealth();
        const end = performance.now();
        setHealth(data);
        setIsOnline(true);
        setLatency(Math.round(end - start));
      } catch (err) {
        console.error("Health check error:", err);
        setIsOnline(false);
      }
    };

    probeHealth();
    const interval = setInterval(probeHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/live", label: "Live Shield", icon: Radio },
    { href: "/upload", label: "File Inspector", icon: Upload },
    { href: "/voiceprint", label: "Voiceprints", icon: Fingerprint },
    { href: "/soc", label: "SOC Center", icon: ShieldAlert },
    { href: "/war-room", label: "War Room", icon: PhoneForwarded },
    { href: "/benchmark", label: "Benchmark", icon: Cpu },
    { href: "/multilingual", label: "Vernacular", icon: Languages },
    { href: "/adversarial", label: "Adversarial", icon: ShieldMinus },
    { href: "/threat-intel", label: "Threat Intel", icon: Globe },
    { href: "/pitch", label: "Jury Pitch", icon: Award },
    { href: "/developer", label: "Developer", icon: Code2 },
    { href: "/history", label: "Threat Logs", icon: History },
    { href: "/demo-lab", label: "Demo Lab", icon: AlertTriangle },
    { href: "/settings", label: "Policy", icon: Sliders },
    { href: "/about", label: "Architecture", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-900/30 bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 group-hover:border-cyan-400 transition-all duration-300">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm group-hover:blur-md" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-white">VoiceGuard</span>
              <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Voice Cloning Defense System
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Health Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline === true
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                  : isOnline === false
                  ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-slate-300 font-mono text-[11px]">
              {isOnline === true
                ? `Core: Online ${latency ? `(${latency}ms)` : ""}`
                : isOnline === false
                ? "Core: Disconnected"
                : "Checking Core..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
