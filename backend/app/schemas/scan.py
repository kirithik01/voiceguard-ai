from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class ChunkScoreSchema(BaseModel):
    chunk_index: int
    start_sec: float
    end_sec: float
    label: Literal["genuine", "synthetic"]
    confidence: float
    risk_score: float

class AcousticFeaturesSchema(BaseModel):
    pitch_mean_hz: Optional[float] = None
    pitch_std_hz: Optional[float] = None
    pitch_variability_label: Optional[str] = None
    spectral_flatness: Optional[float] = None
    spectral_centroid_hz: Optional[float] = None
    zero_crossing_rate: Optional[float] = None
    neural_vocoder_artifact_score: Optional[float] = None

class AnalyzeResultSchema(BaseModel):
    test_id: str
    timestamp: str
    source_type: Literal["upload", "live"]
    filename_or_label: str
    verdict: Literal["genuine", "synthetic"]
    risk_score: float = Field(ge=0.0, le=100.0)
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    recommended_action: str
    audio_duration_sec: float
    chunk_scores: List[ChunkScoreSchema] = []
    acoustic_features: Optional[AcousticFeaturesSchema] = None

    # Phase 4 Enterprise SOC & Biometrics extensions
    incident_status: Optional[str] = "OPEN"
    sha256_hash: Optional[str] = None
    speaker_match_score: Optional[float] = None
    matched_speaker_name: Optional[str] = None

class HistoryItemSchema(BaseModel):
    id: str
    timestamp: str
    source_type: Literal["upload", "live"]
    filename_or_label: str
    verdict: Literal["genuine", "synthetic"]
    risk_score: float
    confidence: float
    reason: str
    recommended_action: str
    audio_duration_sec: float
    chunk_scores: List[ChunkScoreSchema] = []
    acoustic_features: Optional[AcousticFeaturesSchema] = None

    # Phase 4 Enterprise SOC & Biometrics extensions
    incident_status: Optional[str] = "OPEN"
    sha256_hash: Optional[str] = None
    speaker_match_score: Optional[float] = None
    matched_speaker_name: Optional[str] = None
