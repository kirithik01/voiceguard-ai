import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text
from app.db.session import Base

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(String(50), default=lambda: datetime.now(timezone.utc).isoformat())
    source_type = Column(String(20), default="upload")  # 'upload' or 'live'
    filename_or_label = Column(String(255), nullable=False)
    verdict = Column(String(20), nullable=False)  # 'genuine' or 'synthetic'
    risk_score = Column(Float, nullable=False)  # 0.0 to 100.0
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    audio_duration_sec = Column(Float, default=0.0)
    chunk_scores = Column(Text, default="[]")  # JSON string array
    acoustic_features = Column(Text, default="{}")  # JSON string object

    # Phase 4 Enterprise SOC & Biometrics extensions
    incident_status = Column(String(30), default="OPEN")  # 'OPEN', 'INVESTIGATING', 'CONTAINED', 'FALSE_POSITIVE'
    sha256_hash = Column(String(64), nullable=True)  # Evidence chain-of-custody checksum
    speaker_match_score = Column(Float, nullable=True)  # Biometric similarity percentage (0-100)
    matched_speaker_name = Column(String(120), nullable=True)  # Enrolled executive name

    def __repr__(self):
        return f"<ScanRecord id={self.id} file={self.filename_or_label} verdict={self.verdict} risk={self.risk_score} status={self.incident_status}>"
