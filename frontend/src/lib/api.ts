import { HealthResponse, AnalyzeResult, HistoryItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`);
  }
  return res.json();
}

export async function analyzeAudioFile(file: File): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/analyze/file`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Audio analysis failed");
  }

  return res.json();
}

export async function analyzeLiveChunk(
  audioBlob: Blob,
  chunkIndex: number,
  isFinal: boolean = false
): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("chunk", audioBlob, `chunk_${chunkIndex}.webm`);
  formData.append("chunk_index", chunkIndex.toString());
  formData.append("is_final", isFinal.toString());

  const res = await fetch(`${API_BASE_URL}/api/analyze/live-chunk`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Live chunk analysis failed" }));
    throw new Error(err.detail || "Live chunk analysis failed");
  }

  return res.json();
}

export async function getTestHistory(verdictFilter?: string): Promise<HistoryItem[]> {
  const url = new URL(`${API_BASE_URL}/api/history`);
  if (verdictFilter && verdictFilter !== "all") {
    url.searchParams.set("verdict", verdictFilter);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.status}`);
  }
  return res.json();
}

export async function getTestById(id: string): Promise<AnalyzeResult> {
  const res = await fetch(`${API_BASE_URL}/api/history/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch test ${id}: ${res.status}`);
  }
  return res.json();
}

export async function deleteTestById(id: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete test ${id}: ${res.status}`);
  }
  return res.json();
}

export async function clearHistory(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/history`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to clear history: ${res.status}`);
  }
  return res.json();
}

export async function getDemoSamples(): Promise<import("./types").DemoSample[]> {
  const res = await fetch(`${API_BASE_URL}/api/samples`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch demo samples: ${res.status}`);
  }
  return res.json();
}

export async function runDemoSample(sampleId: string): Promise<AnalyzeResult> {
  const res = await fetch(`${API_BASE_URL}/api/samples/${sampleId}/run`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to execute sample analysis: ${res.status}`);
  }
  return res.json();
}

export async function generateCustomTTS(
  text: string,
  voice: string = "en-US-ChristopherNeural"
): Promise<import("./types").GenerateTTSResponse> {
  const res = await fetch(`${API_BASE_URL}/api/samples/generate-tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "TTS generation failed" }));
    throw new Error(err.detail || "TTS generation failed");
  }
  return res.json();
}

export function getSampleAudioUrl(sampleId: string): string {
  return `${API_BASE_URL}/api/samples/${sampleId}/audio`;
}

// Phase 4: Speaker Biometrics & Voiceprint Enrollment APIs
export async function getEnrolledSpeakers(): Promise<import("./types").SpeakerProfile[]> {
  const res = await fetch(`${API_BASE_URL}/api/speakers`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch speakers: ${res.status}`);
  }
  return res.json();
}

export async function enrollSpeaker(formData: FormData): Promise<import("./types").SpeakerProfile> {
  const res = await fetch(`${API_BASE_URL}/api/speakers/enroll`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Enrollment failed" }));
    throw new Error(err.detail || "Voice enrollment failed");
  }
  return res.json();
}

export async function deleteSpeaker(speakerId: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/speakers/${speakerId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete speaker: ${res.status}`);
  }
  return res.json();
}

export async function verifySpeakerDualEngine(
  speakerId: string,
  audioFile: File
): Promise<import("./types").DualEngineResult> {
  const formData = new FormData();
  formData.append("speaker_id", speakerId);
  formData.append("file", audioFile);

  const res = await fetch(`${API_BASE_URL}/api/speakers/verify`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Verification failed" }));
    throw new Error(err.detail || "Dual-Engine verification failed");
  }
  return res.json();
}

// Phase 4: Enterprise SOC Analytics & Incident Triage APIs
export async function getSOCAnalytics(): Promise<import("./types").SOCAnalytics> {
  const res = await fetch(`${API_BASE_URL}/api/soc/analytics`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch SOC analytics: ${res.status}`);
  }
  return res.json();
}

export async function updateIncidentStatus(
  scanId: string,
  status: string,
  analystNote?: string
): Promise<{ status: string; new_status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/soc/incidents/${scanId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, analyst_note: analystNote }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update status: ${res.status}`);
  }
  return res.json();
}

export async function dispatchSIEMAlert(
  scanId: string
): Promise<{ status: string; destination: string; alert_payload: any }> {
  const res = await fetch(`${API_BASE_URL}/api/soc/incidents/${scanId}/dispatch-alert`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to dispatch SIEM alert: ${res.status}`);
  }
  return res.json();
}

// Phase 5: Settings and Acoustic Watermarking APIs
export async function getSystemSettings(): Promise<import("./types").SystemSettings> {
  const res = await fetch(`${API_BASE_URL}/api/settings`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.status}`);
  }
  return res.json();
}

export async function updateSystemSettings(
  payload: Partial<import("./types").SystemSettings>
): Promise<import("./types").SystemSettings> {
  const res = await fetch(`${API_BASE_URL}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update settings: ${res.status}`);
  }
  return res.json();
}

export async function embedAudioWatermark(file: File, customTag?: string): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  if (customTag) {
    formData.append("custom_tag", customTag);
  }

  const res = await fetch(`${API_BASE_URL}/api/watermark/embed`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Watermark embedding failed with status ${res.status}`);
  }
  return res.blob();
}

export async function verifyAudioWatermark(file: File): Promise<import("./types").WatermarkVerifyResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/watermark/verify`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Watermark verification failed with status ${res.status}`);
  }
  return res.json();
}

// Phase 6: Telephony War Room & Benchmark APIs
export async function getPBXLines(): Promise<import("./types").PBXLine[]> {
  const res = await fetch(`${API_BASE_URL}/api/telephony/lines`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch PBX lines: ${res.status}`);
  }
  return res.json();
}

export async function simulatePBXCall(formData: FormData): Promise<import("./types").PBXCallResult> {
  const res = await fetch(`${API_BASE_URL}/api/telephony/simulate-call`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "PBX Call simulation failed" }));
    throw new Error(err.detail || "PBX Call simulation failed");
  }
  return res.json();
}

export async function runTelecomBenchmark(formData: FormData): Promise<import("./types").CodecBenchmarkResult> {
  const res = await fetch(`${API_BASE_URL}/api/telephony/benchmark/run`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Benchmark execution failed: ${res.status}`);
  }
  return res.json();
}

export async function getLegalDossier(scanId: string): Promise<import("./types").LegalDossierData> {
  const res = await fetch(`${API_BASE_URL}/api/telephony/dossier/${scanId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to compile legal dossier: ${res.status}`);
  }
  return res.json();
}

// Phase 7: Global Threat Intelligence APIs
export async function getThreatIntelStats(): Promise<import("./types").ThreatIntelStats> {
  const res = await fetch(`${API_BASE_URL}/api/threat-intel/stats`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch threat intel stats: ${res.status}`);
  }
  return res.json();
}

export async function getThreatIntelMap(): Promise<import("./types").ThreatGeoPoint[]> {
  const res = await fetch(`${API_BASE_URL}/api/threat-intel/map`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch threat map: ${res.status}`);
  }
  return res.json();
}

export async function getThreatIntelFeed(): Promise<import("./types").ThreatFeedItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/threat-intel/feed`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch threat feed: ${res.status}`);
  }
  return res.json();
}

// Phase 8: Multi-Lingual Vernacular & Adversarial APIs
export async function getVernacularSamples(): Promise<import("./types").VernacularSample[]> {
  const res = await fetch(`${API_BASE_URL}/api/multilingual/samples`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch vernacular samples: ${res.status}`);
  }
  return res.json();
}

export async function generateVernacularClone(
  text: string,
  language: string,
  voice?: string
): Promise<{ result: import("./types").AnalyzeResult; audio_url: string; language: string; voice: string }> {
  const res = await fetch(`${API_BASE_URL}/api/multilingual/generate-vernacular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, voice }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Vernacular synthesis failed" }));
    throw new Error(err.detail || "Vernacular synthesis failed");
  }
  return res.json();
}

export async function runAdversarialStressTest(formData: FormData): Promise<import("./types").AdversarialStressTestResult> {
  const res = await fetch(`${API_BASE_URL}/api/adversarial/stress-test`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Adversarial stress test failed: ${res.status}`);
  }
  return res.json();
}

export { API_BASE_URL };






