export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  model: string;
  thresholds: {
    low_risk: number;
    high_risk: number;
  };
}

export interface ChunkScore {
  chunk_index: number;
  start_sec: number;
  end_sec: number;
  label: "genuine" | "synthetic";
  confidence: number;
  risk_score: number;
}

export interface AcousticFeatures {
  pitch_mean_hz?: number;
  pitch_std_hz?: number;
  pitch_variability_label?: string;
  spectral_flatness?: number;
  spectral_centroid_hz?: number;
  zero_crossing_rate?: number;
  neural_vocoder_artifact_score?: number;
}

export interface AnalyzeResult {
  test_id: string;
  timestamp: string;
  source_type: "upload" | "live";
  filename_or_label: string;
  verdict: "genuine" | "synthetic";
  risk_score: number; // 0 - 100
  confidence: number; // 0 - 1
  reason: string;
  recommended_action: string;
  audio_duration_sec: number;
  chunk_scores: ChunkScore[];
  acoustic_features?: AcousticFeatures;
  incident_status?: string;
  sha256_hash?: string;
  speaker_match_score?: number;
  matched_speaker_name?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  source_type: "upload" | "live";
  filename_or_label: string;
  verdict: "genuine" | "synthetic";
  risk_score: number;
  confidence: number;
  reason: string;
  recommended_action: string;
  audio_duration_sec: number;
  chunk_scores: ChunkScore[];
  acoustic_features?: AcousticFeatures;
  incident_status?: string;
  sha256_hash?: string;
  speaker_match_score?: number;
  matched_speaker_name?: string;
}

export interface DemoSample {
  id: string;
  title: string;
  filename: string;
  category: string;
  threat_level: string;
  description: string;
  expected_verdict: "genuine" | "synthetic";
  duration_sec: number;
  audio_url: string;
}

export interface GenerateTTSResponse {
  result: AnalyzeResult;
  audio_url: string;
}

export interface SpeakerProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  created_at: string;
  sample_filename?: string;
  baseline_pitch_hz?: number;
}

export interface DualEngineResult {
  test_id: string;
  timestamp: string;
  speaker_id: string;
  speaker_name: string;
  speaker_role: string;
  liveness_verdict: string;
  liveness_risk_score: number;
  biometric_match_verdict: string;
  biometric_similarity_pct: number;
  dual_engine_final_verdict: string;
  reason: string;
  recommended_action: string;
  forensic_details: AnalyzeResult;
}

export interface IncidentSummary {
  id: string;
  timestamp: string;
  filename_or_label: string;
  verdict: string;
  risk_score: number;
  incident_status: string;
  sha256_hash?: string;
  reason: string;
  recommended_action: string;
}

export interface SOCAnalytics {
  total_scans: number;
  open_incidents: number;
  contained_threats: number;
  false_positives: number;
  high_risk_attacks: number;
  average_risk_score: number;
  attack_vectors: { name: string; value: number }[];
  vocoder_breakdown: { name: string; value: number }[];
  status_breakdown: Record<string, number>;
  recent_incidents: IncidentSummary[];
}

export interface SystemSettings {
  app_name: string;
  security_tier: "strict" | "standard" | "permissive";
  low_risk_threshold: number;
  high_risk_threshold: number;
  auto_mitigation: "vocal_otp" | "hangup" | "log_only";
  siem_webhook_url: string;
}

export interface WatermarkVerifyResponse {
  is_watermarked: boolean;
  confidence: number;
  signature_status: string;
  explanation: string;
  sha256_hash: string;
  audio_duration_sec: number;
}

export interface PBXLine {
  line_id: string;
  name: string;
  extension: string;
  status: string;
  last_caller: string;
  last_decision: string;
}

export interface PBXCallResult {
  call_id: string;
  timestamp: string;
  line_id: string;
  line_name: string;
  extension: string;
  caller_name: string;
  caller_number: string;
  verdict: string;
  risk_score: number;
  routing_decision: string;
  routing_reason: string;
  sip_response_code: number;
  evidence_sha256: string;
  blacklist_status: string;
}

export interface CodecProfileResult {
  profile_name: string;
  risk_score: number;
  verdict: string;
  confidence: number;
  pitch_std_hz?: number;
  spectral_flatness?: number;
  resilience_verdict: string;
}

export interface CodecBenchmarkResult {
  benchmark_summary: {
    overall_consistency_pct: number;
    baseline_verdict: string;
    robustness_rating: string;
  };
  profiles: CodecProfileResult[];
}

export interface LegalDossierData {
  case_reference: string;
  statutory_citation: string;
  court_admissibility_standard: string;
  incident_id: string;
  timestamp: string;
  target_channel: string;
  verdict: string;
  risk_score: number;
  evidence_sha256: string;
  forensic_scientific_analysis: string;
  mandated_mitigation: string;
  acoustic_metrics: Record<string, any>;
  chain_of_custody: { step: string; actor: string; details: string }[];
}

export interface ThreatIntelStats {
  attacks_intercepted: number;
  total_fraud_averted_usd: number;
  avg_latency_ms: number;
  active_syndicates_tracked: number;
  telecom_blacklisted_numbers: number;
  clean_audio_certified: number;
}

export interface ThreatGeoPoint {
  id: string;
  hub_name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  target_sector: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  vocoder_signature: string;
  last_intercept: string;
  threat_vector: string;
}

export interface ThreatFeedItem {
  id: string;
  timestamp: string;
  target_sector: string;
  channel: string;
  verdict: string;
  risk_score: number;
  vocoder_family: string;
  averted_loss_usd: number;
  origin_hub: string;
}

export interface VernacularSample {
  id: string;
  language: string;
  title: string;
  text: string;
  voice: string;
  target_sector: string;
  threat_level: string;
  expected_verdict: string;
}

export interface AdversarialStage {
  stage_name: string;
  verdict: string;
  risk_score: number;
  confidence: number;
  vocoder_index: number;
  description: string;
}

export interface AdversarialStressTestResult {
  is_resilient: boolean;
  adversarial_bypass_prevented: boolean;
  stages: AdversarialStage[];
}




