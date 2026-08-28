from typing import Optional, List
from pydantic import BaseModel
from app.schemas.scan import AnalyzeResultSchema

class SpeakerProfileSchema(BaseModel):
    id: str
    name: str
    role: str
    department: str
    created_at: str
    sample_filename: Optional[str] = None
    baseline_pitch_hz: Optional[float] = None

class DualEngineVerificationResponse(BaseModel):
    test_id: str
    timestamp: str
    speaker_id: str
    speaker_name: str
    speaker_role: str
    
    # Dual-Engine Scores:
    liveness_verdict: str  # 'genuine' or 'synthetic'
    liveness_risk_score: float  # 0 - 100 (Deepfake Risk)
    
    biometric_match_verdict: str  # 'MATCH_CONFIRMED' or 'IMPOSTOR_MISMATCH'
    biometric_similarity_pct: float  # 0 - 100% (Voiceprint Similarity)
    
    dual_engine_final_verdict: str  # 'AUTHORIZED_AUTHENTIC' | 'IMPERSONATION_ATTACK' | 'SPOOFED_CLONE'
    reason: str
    recommended_action: str
    forensic_details: AnalyzeResultSchema
