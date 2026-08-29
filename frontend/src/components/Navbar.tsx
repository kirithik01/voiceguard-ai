"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Radio,
  Upload,
  History,
  Info,
  Activity,
  AlertTriangle,
  Fingerprint,
  ShieldAlert,
  Sliders,
  PhoneForwarded,
  Cpu,
  Globe,
  Award,
  Code2,
  Languages,
  ShieldMinus,
  ChevronDown,
  Layers,
  Menu,
  X
} from "lucide-react";
import { checkHealth } from "@/lib/api";
import { HealthResponse } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Dropdown & Mobile Menu State
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Primary 5 core visible links (Option 1)
  const primaryLinks = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/live", label: "Live Shield", icon: Radio },
    { href: "/upload", label: "File Inspector", icon: Upload },
    { href: "/history", label: "Threat Logs", icon: History },
    { href: "/demo-lab", label: "Demo Lab", icon: AlertTriangle },
  ];

  // Grouped Dropdown Navigation (10 specialized tools)
  const moreGroups = [
    {
      title: "Operations & War Room",
      items: [
        {
          href: "/soc",
          label: "SOC Center",
          icon: ShieldAlert,
          desc: "Incident queue & CERT-In compliance"
        },
        {
          href: "/war-room",
          label: "War Room",
          icon: PhoneForwarded,
          desc: "PBX switchboard & SIP routing"
        },
        {
          href: "/threat-intel",
          label: "Threat Intel",
          icon: Globe,
          desc: "Geospatial radar & live feed"
        },
      ]
    },
    {
      title: "Forensics & Stress Labs",
      items: [
        {
          href: "/benchmark",
          label: "Benchmark",
          icon: Cpu,
          desc: "Codec stress & PSTN degradation"
        },
        {
          href: "/multilingual",
          label: "Vernacular",
          icon: Languages,
          desc: "Hindi, Tamil & regional defense"
        },
        {
          href: "/adversarial",
          label: "Adversarial",
          icon: ShieldMinus,
          desc: "Perturbation & denoising studio"
        },
      ]
    },
    {
      title: "Identity & Platform",
      items: [
        {
          href: "/voiceprint",
          label: "Voiceprints",
          icon: Fingerprint,
          desc: "Dual-engine speaker biometrics"
        },
        {
          href: "/settings",
          label: "Policy",
          icon: Sliders,
          desc: "Thresholds & watermark studio"
        },
        {
          href: "/developer",
          label: "Developer",
          icon: Code2,
          desc: "REST API & integration code"
        },
        {
          href: "/about",
          label: "Architecture",
          icon: Info,
          desc: "Forensic acoustic science specs"
        },
      ]
    }
  ];

  // Check if any link inside "More" dropdown is currently active
  const isMoreActive = moreGroups.some((group) =>
    group.items.some((item) => pathname === item.href)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E3DCF0] bg-[#F3EEFB]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#B8A6E8]/30 border border-[#B8A6E8] group-hover:border-[#8E79C9] transition-all duration-300 shadow-sm">
            <Shield className="w-5 h-5 text-[#3A3450] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-[#3A3450]">VoiceGuard</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#B8A6E8]/40 text-[#3A3450] border border-[#B8A6E8]">
                AI
              </span>
            </div>
            <p className="text-[10px] text-[#7A7390] tracking-wider uppercase font-medium">
              Voice Cloning Defense System
            </p>
          </div>
        </Link>

        {/* Primary Desktop Navigation (5 Core Tools + 1 More Dropdown = 6 Items) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#B8A6E8] text-[#3A3450] shadow-sm border border-[#A792E0]"
                    : "text-[#7A7390] hover:text-[#3A3450] hover:bg-[#EAF6F2]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#3A3450]" : "text-[#7A7390]"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* "More Tools ▾" Popover Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dropdownOpen || isMoreActive
                  ? "bg-[#B8A6E8] text-[#3A3450] shadow-sm border border-[#A792E0]"
                  : "text-[#7A7390] hover:text-[#3A3450] hover:bg-[#EAF6F2]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>More Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-[#3A3450]" : ""
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {dropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] rounded-3xl bg-[#F3EEFB] border border-[#E3DCF0] shadow-2xl p-5 grid grid-cols-3 gap-5 animate-fadeIn z-50">
                {moreGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase text-[#7c63c7] tracking-wider block px-1">
                      {group.title}
                    </span>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isSubActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`p-2.5 rounded-2xl transition-all block group ${
                              isSubActive
                                ? "bg-[#B8A6E8]/50 border border-[#B8A6E8] shadow-xs"
                                : "hover:bg-[#FBF7F4] hover:border-[#E3DCF0] border border-transparent"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <ItemIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isSubActive
                                    ? "text-[#3A3450]"
                                    : "text-[#8E79C9] group-hover:scale-110 transition-transform"
                                }`}
                              />
                              <span
                                className={`text-xs font-bold ${
                                  isSubActive ? "text-[#3A3450]" : "text-[#3A3450] group-hover:text-[#7c63c7]"
                                }`}
                              >
                                {item.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#7A7390] mt-0.5 leading-snug line-clamp-1 pl-5.5">
                              {item.desc}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side: Standalone Present Button + System Health Status Pill */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Dedicated "Present / Pitch" Button (Separate from Tools) */}
          <Link
            href="/pitch"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              pathname === "/pitch"
                ? "bg-[#B8A6E8] text-[#3A3450] border border-[#8E79C9] shadow-sm"
                : "bg-[#B8A6E8]/30 hover:bg-[#B8A6E8] text-[#3A3450] border border-[#B8A6E8]"
            }`}
            title="Jury Pitch & Evaluator Presentation Console"
          >
            <Award className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>Present</span>
          </Link>

          {/* System Health Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF6F2] border border-[#E3DCF0] text-xs shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline === true
                  ? "bg-[#2E9E5B] animate-pulse shadow-[0_0_6px_#2E9E5B]"
                  : isOnline === false
                  ? "bg-[#D6395B] shadow-[0_0_6px_#D6395B]"
                  : "bg-[#C98A1F] animate-pulse"
              }`}
            />
            <span className="text-[#3A3450] font-mono text-[11px] font-semibold">
              {isOnline === true
                ? `Core: Online ${latency ? `(${latency}ms)` : ""}`
                : isOnline === false
                ? "Core: Disconnected"
                : "Checking Core..."}
            </span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl text-[#3A3450] hover:bg-[#EAF6F2] transition-colors border border-[#E3DCF0]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (When Open) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E3DCF0] bg-[#F3EEFB] px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto animate-fadeIn">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#7c63c7] block mb-1">
              Core Security Tools
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {primaryLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#B8A6E8] text-[#3A3450]"
                        : "bg-[#FBF7F4] text-[#7A7390] hover:text-[#3A3450]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {moreGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#7c63c7] block mb-1">
                {group.title}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isSubActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isSubActive
                          ? "bg-[#B8A6E8] text-[#3A3450]"
                          : "bg-[#FBF7F4] text-[#7A7390] hover:text-[#3A3450]"
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
