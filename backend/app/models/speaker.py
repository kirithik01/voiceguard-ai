import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from app.db.session import Base

class SpeakerProfile(Base):
    __tablename__ = "speaker_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    role = Column(String(120), nullable=False)
    department = Column(String(120), nullable=False)
    created_at = Column(String(50), default=lambda: datetime.now(timezone.utc).isoformat())
    sample_filename = Column(String(255), nullable=True)
    voiceprint_embedding = Column(Text, nullable=False)  # JSON string of formant & pitch vectors

    def __repr__(self):
        return f"<SpeakerProfile id={self.id} name={self.name} role={self.role}>"
