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
      Authorization: "Bearer ${apiKey}"
    }
  });

  console.log("Verdict:", response.data.verdict);
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

data = {"speaker_id": "spk_cfo_satya"}
with open("incoming_call.wav", "rb") as f:
    files = {"file": ("incoming_call.wav", f, "audio/wav")}
    res = requests.post(url, headers=headers, data=data, files=files)

print(res.json()["dual_engine_final_verdict"])  # AUTHORIZED_AUTHENTIC or SPOOFED_CLONE`;
      } else if (selectedLang === "javascript") {
        return `const formData = new FormData();
formData.append("speaker_id", "spk_cfo_satya");
formData.append("file", fileBlob);

const res = await fetch("http://localhost:8001/api/speakers/verify", {
  method: "POST",
  headers: { "Authorization": "Bearer ${apiKey}" },
  body: formData
});

const result = await res.json();
console.log("Biometric Decision:", result.dual_engine_final_verdict);`;
      } else {
        return `curl -X POST "http://localhost:8001/api/speakers/verify" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "speaker_id=spk_cfo_satya" \\
  -F "file=@incoming_call.wav"`;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCF0] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B8A6E8]/30 border border-[#B8A6E8] text-xs font-mono text-[#3A3450] font-semibold mb-2">
            <Code2 className="w-3.5 h-3.5 text-[#3A3450]" />
            <span>ENTERPRISE DEVELOPER PORTAL & REST API SANDBOX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3450] tracking-tight">
            Developer Integration Gateway
          </h1>
          <p className="text-sm text-[#7A7390] mt-1">
            Embed VoiceGuard deepfake detection and speaker biometrics directly into Twilio, Asterisk, WebRTC, or custom banking applications in under 5 minutes.
          </p>
        </div>

        <a
          href="http://127.0.0.1:8001/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs flex items-center space-x-1.5 transition-all self-start md:self-auto shadow-sm"
        >
          <span>Interactive Swagger Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* API Key Provisioning Card */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 border border-[#E3DCF0] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-[#8E79C9]" />
            <h3 className="text-sm font-bold text-[#3A3450] font-mono uppercase">
              Production API Secret Token
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#2E9E5B] bg-[#DFF5E6] px-2.5 py-0.5 rounded-full border border-[#2E9E5B] font-bold">
            Active Provisioning
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 p-3 rounded-xl bg-[#FBF7F4] border border-[#E3DCF0] font-mono text-xs text-[#7c63c7] font-bold select-all"
          />
          <button
            onClick={handleCopyKey}
            className="px-4 py-3 rounded-xl bg-[#B8A6E8] hover:bg-[#A792E0] text-[#3A3450] font-bold text-xs font-mono flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            {copiedKey ? <Check className="w-4 h-4 text-[#2E9E5B]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey ? "Copied" : "Copy Token"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Code Generator & Sandbox */}
      <div className="rounded-3xl bg-[#F3EEFB] p-6 sm:p-7 border border-[#E3DCF0] space-y-6 shadow-sm">
        {/* Endpoint Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E3DCF0] pb-4">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setSelectedEndpoint("analyze")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedEndpoint === "analyze"
                  ? "bg-[#B8A6E8] text-[#3A3450] font-bold shadow-xs"
                  : "text-[#7A7390] hover:text-[#3A3450] hover:bg-[#EAF6F2]"
              }`}
            >
              POST /api/analyze/file
            </button>
            <button
              onClick={() => setSelectedEndpoint("verify_speaker")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedEndpoint === "verify_speaker"
                  ? "bg-[#B8A6E8] text-[#3A3450] font-bold shadow-xs"
                  : "text-[#7A7390] hover:text-[#3A3450] hover:bg-[#EAF6F2]"
              }`}
            >
              POST /api/speakers/verify
            </button>
            <button
              onClick={() => setSelectedEndpoint("watermark")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedEndpoint === "watermark"
                  ? "bg-[#B8A6E8] text-[#3A3450] font-bold shadow-xs"
                  : "text-[#7A7390] hover:text-[#3A3450] hover:bg-[#EAF6F2]"
              }`}
            >
              POST /api/watermark/verify
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-[#FBF7F4] p-1 rounded-xl border border-[#E3DCF0] text-xs font-mono">
            {(["python", "javascript", "curl"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-lg transition-colors uppercase font-bold ${
                  selectedLang === lang
                    ? "bg-[#B8A6E8] text-[#3A3450] shadow-xs"
                    : "text-[#7A7390] hover:text-[#3A3450]"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-2xl bg-[#1E192E] border border-[#E3DCF0] p-5 overflow-x-auto shadow-inner">
          <button
            onClick={() => handleCopySnippet(snippet, "code")}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center space-x-1 transition-colors"
          >
            {copiedCode === "code" ? (
              <Check className="w-3.5 h-3.5 text-[#2E9E5B]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white" />
            )}
            <span>{copiedCode === "code" ? "Copied" : "Copy"}</span>
          </button>

          <pre className="font-mono text-xs text-purple-200 leading-relaxed pt-2">
            <code>{snippet}</code>
          </pre>
        </div>

        {/* Sample Response JSON */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#7A7390] uppercase">
            Sample HTTP 200 Response Payload
          </span>
          <div className="rounded-2xl bg-[#FBF7F4] border border-[#E3DCF0] p-4 text-xs font-mono text-[#3A3450] shadow-xs">
            <pre>
{`{
  "test_id": "vg_scan_78a1bc90",
  "verdict": "synthetic",
  "risk_score": 88.4,
  "confidence": 0.96,
  "reason": "Severe HiFi-GAN deconvolutional artifact detected with unnatural pitch flatlining.",
  "recommended_action": "TERMINATE_CALL_AND_ENFORCE_MFA",
  "timestamp": "2026-08-28T10:14:22Z"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
