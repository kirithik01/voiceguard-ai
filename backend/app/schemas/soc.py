from typing import List, Dict, Optional
from pydantic import BaseModel

class IncidentSummary(BaseModel):
    id: str
    timestamp: str
    filename_or_label: str
    verdict: str
    risk_score: float
    incident_status: str
    sha256_hash: Optional[str] = None
    reason: str
    recommended_action: str

class SOCAnalyticsResponse(BaseModel):
    total_scans: int
    open_incidents: int
    contained_threats: int
    false_positives: int
    high_risk_attacks: int
    average_risk_score: float
    
    # Distributions
    attack_vectors: List[Dict[str, str | int]]
    vocoder_breakdown: List[Dict[str, str | int]]
    status_breakdown: Dict[str, int]
    recent_incidents: List[IncidentSummary]

class UpdateIncidentStatusRequest(BaseModel):
    status: str  # 'OPEN', 'INVESTIGATING', 'CONTAINED', 'FALSE_POSITIVE'
    analyst_note: Optional[str] = None
