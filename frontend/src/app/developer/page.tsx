"use client";

import React, { useState } from "react";
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Key,
  Play,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Shield
} from "lucide-react";

export default function DeveloperPortalPage() {
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"python" | "javascript" | "curl">("python");
  const [selectedEndpoint, setSelectedEndpoint] = useState<"analyze" | "verify_speaker" | "watermark">("analyze");

  const apiKey = "vg_live_9a8f2c019b88e40428d01fa38290e29b";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCodeSnippet = () => {
    if (selectedEndpoint === "analyze") {
      if (selectedLang === "python") {
        return `import requests

url = "http://localhost:8001/api/analyze/file"
headers = {"Authorization": "Bearer ${apiKey}"}

with open("inbound_audio.wav", "rb") as f:
    files = {"file": ("inbound_audio.wav", f, "audio/wav")}
    response = requests.post(url, headers=headers, files=files)

data = response.json()
print("Verdict:", data["verdict"])        # 'genuine' or 'synthetic'
print("Risk Score:", data["risk_score"])   # 0 - 100%
print("Reason:", data["reason"])`;
      } else if (selectedLang === "javascript") {
        return `const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

async function scanAudio() {
  const form = new FormData();
  form.append("file", fs.createReadStream("inbound_audio.wav"));

  const response = await axios.post("http://localhost:8001/api/analyze/file", form, {
    headers: {
      ...form.getHeaders(),
      "Authorization": "Bearer ${apiKey}"
    }
  });

  console.log("Analysis Verdict:", response.data.verdict);
  console.log("Risk Score:", response.data.risk_score);
}

scanAudio();`;
      } else {
        return `curl -X POST "http://localhost:8001/api/analyze/file" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "file=@inbound_audio.wav"`;
      }
    } else if (selectedEndpoint === "verify_speaker") {
      if (selectedLang === "python") {
        return `import requests

url = "http://localhost:8001/api/speakers/verify"
headers = {"Authorization": "Bearer ${apiKey}"}

with open("executive_call.wav", "rb") as f:
    data = {"speaker_id": "spk_exec_ceo_01"}
    files = {"file": ("executive_call.wav", f, "audio/wav")}
    response = requests.post(url, headers=headers, data=data, files=files)

result = response.json()
print("Dual Verdict:", result["dual_engine_final_verdict"])
print("Biometric Match:", result["biometric_similarity_pct"], "%")
print("Liveness Risk:", result["liveness_risk_score"], "%")`;
      } else if (selectedLang === "javascript") {
        return `const formData = new FormData();
formData.append("speaker_id", "spk_exec_ceo_01");
formData.append("file", audioBlob, "audio.wav");

const res = await fetch("http://localhost:8001/api/speakers/verify", {
  method: "POST",
  headers: { "Authorization": "Bearer ${apiKey}" },
  body: formData
});

const data = await res.json();
console.log("Verdict:", data.dual_engine_final_verdict);`;
      } else {
        return `curl -X POST "http://localhost:8001/api/speakers/verify" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "speaker_id=spk_exec_ceo_01" \\
  -F "file=@executive_call.wav"`;
      }
    } else {
      if (selectedLang === "python") {
        return `import requests

url = "http://localhost:8001/api/watermark/verify"
with open("inbound_stream.wav", "rb") as f:
    files = {"file": ("inbound_stream.wav", f, "audio/wav")}
    response = requests.post(url, files=files)

data = response.json()
print("Watermark Present:", data["is_watermarked"])
print("Signature Status:", data["signature_status"])`;
      } else if (selectedLang === "javascript") {
        return `const formData = new FormData();
formData.append("file", file);

const res = await fetch("http://localhost:8001/api/watermark/verify", {
  method: "POST",
  body: formData
});

const data = await res.json();
console.log("Authentic Source:", data.is_watermarked);`;
      } else {
        return `curl -X POST "http://localhost:8001/api/watermark/verify" \\
  -F "file=@inbound_stream.wav"`;
      }
    }
  };

  const snippet = getCodeSnippet();

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE DEVELOPER PORTAL & REST API SANDBOX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Developer Integration Gateway
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Embed VoiceGuard deepfake detection and speaker biometrics directly into Twilio, Asterisk, WebRTC, or custom banking applications in under 5 minutes.
          </p>
        </div>

        <a
          href="http://127.0.0.1:8001/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all self-start md:self-auto shadow-md shadow-cyan-500/20"
        >
          <span>Interactive Swagger Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* API Key Provisioning Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Production API Secret Token
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Active Provisioning
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 select-all"
          />
          <button
            onClick={handleCopyKey}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey ? "Copied" : "Copy Token"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Code Generator & Sandbox */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        {/* Endpoint Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setSelectedEndpoint("analyze")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedEndpoint === "analyze"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              POST /api/analyze/file
            </button>
            <button
              onClick={() => setSelectedEndpoint("verify_speaker")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedEndpoint === "verify_speaker"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              POST /api/speakers/verify
            </button>
            <button
              onClick={() => setSelectedEndpoint("watermark")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedEndpoint === "watermark"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              POST /api/watermark/verify
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(["python", "javascript", "curl"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 rounded transition-colors uppercase ${
                  selectedLang === lang
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <button
            onClick={() => handleCopySnippet(snippet, selectedEndpoint + selectedLang)}
            className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1 transition-colors border border-slate-700"
          >
            {copiedCode === selectedEndpoint + selectedLang ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedCode === selectedEndpoint + selectedLang ? "Copied" : "Copy"}</span>
          </button>

          <pre className="pr-16 text-cyan-200/90 leading-relaxed">{snippet}</pre>
        </div>

        {/* Response Schema Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
            Expected JSON Response Format:
          </span>
          <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
{selectedEndpoint === "analyze"
  ? `{
  "test_id": "9a8b2c01-44de-41fb-99ea-112233445566",
  "timestamp": "2026-08-27T14:30:00Z",
  "verdict": "synthetic",
  "risk_score": 95.5,
  "confidence": 0.98,
  "reason": "Pitch curve is abnormally monotone (pitch std: 4.8 Hz < 15 Hz baseline). STFT Wiener flatness of 0.048 indicates neural diffusion noise floor.",
  "recommended_action": "TERMINATE_CALL_AND_ENFORCE_MFA"
}`
  : selectedEndpoint === "verify_speaker"
  ? `{
  "speaker_name": "Rajesh Verma",
  "speaker_role": "Chief Executive Officer",
  "liveness_verdict": "synthetic",
  "liveness_risk_score": 95.5,
  "biometric_similarity_pct": 69.5,
  "dual_engine_final_verdict": "SPOOFED_CLONE",
  "recommended_action": "BLOCK_TRANSACTION_AND_ALERT_SOC"
}`
  : `{
  "is_watermarked": true,
  "confidence": 0.99,
  "signature_status": "AUTHENTIC_CORPORATE_SIGNATURE",
  "explanation": "Cryptographic watermark verified. Voice originates from authorized enterprise source."
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
