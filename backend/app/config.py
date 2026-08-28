import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "VoiceGuard AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8001
    
    # Model configuration
    MODEL_NAME: str = "garystafford/wav2vec2-deepfake-voice-detector"
    
    # Risk scoring thresholds (0-100)
    LOW_RISK_THRESHOLD: float = 35.0    # 0 - 35: Genuine / Human Voice
    HIGH_RISK_THRESHOLD: float = 65.0   # 66 - 100: Synthetic / AI Voice
    
    # Audio processing settings
    SAMPLE_RATE: int = 16000
    CHUNK_DURATION_SEC: float = 4.0
    CHUNK_STRIDE_SEC: float = 1.0
    MAX_FILE_SIZE_MB: int = 25
    
    # Database
    DATABASE_URL: str = "sqlite:///./voiceguard.db"
    
    # Sample files directory
    SAMPLES_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "samples")

    # Allowed CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]

    class Config:
        env_file = ".env"

settings = Settings()
