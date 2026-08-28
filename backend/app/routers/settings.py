import io
import os
import uuid
import hashlib
import soundfile as sf
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import Response

from app.config import settings
from app.utils.audio_processor import load_audio_from_bytes
from app.utils.watermark import embed_acoustic_watermark, extract_acoustic_watermark

router = APIRouter(tags=["Settings & Watermarking"])

# In-memory mutable settings state
SYSTEM_STATE = {
    "security_tier": "standard",  # 'strict', 'standard', 'permissive'
    "low_risk_threshold": settings.LOW_RISK_THRESHOLD,
    "high_risk_threshold": settings.HIGH_RISK_THRESHOLD,
    "auto_mitigation": "vocal_otp",  # 'vocal_otp', 'hangup', 'log_only'
    "siem_webhook_url": "https://siem.enterprise-corp.internal/api/v1/voice-threats"
}

class SystemSettingsSchema(BaseModel):
    app_name: str
    security_tier: str
    low_risk_threshold: float
    high_risk_threshold: float
    auto_mitigation: str
    siem_webhook_url: str

class UpdateSettingsRequest(BaseModel):
    security_tier: Optional[str] = None
    low_risk_threshold: Optional[float] = None
    high_risk_threshold: Optional[float] = None
    auto_mitigation: Optional[str] = None
    siem_webhook_url: Optional[str] = None

class WatermarkVerifyResponse(BaseModel):
    is_watermarked: bool
    confidence: float
    signature_status: str
    explanation: str
    sha256_hash: str
    audio_duration_sec: float

@router.get("/settings", response_model=SystemSettingsSchema)
async def get_system_settings():
    """
    Returns active risk thresholds, security tier, and automated mitigation rules.
    """
    return SystemSettingsSchema(
        app_name=settings.APP_NAME,
        security_tier=SYSTEM_STATE["security_tier"],
        low_risk_threshold=SYSTEM_STATE["low_risk_threshold"],
        high_risk_threshold=SYSTEM_STATE["high_risk_threshold"],
        auto_mitigation=SYSTEM_STATE["auto_mitigation"],
        siem_webhook_url=SYSTEM_STATE["siem_webhook_url"]
    )

@router.post("/settings", response_model=SystemSettingsSchema)
async def update_system_settings(req: UpdateSettingsRequest):
    """
    Updates enterprise security posture thresholds and mitigation policies dynamically.
    """
    if req.security_tier:
        SYSTEM_STATE["security_tier"] = req.security_tier
        if req.security_tier == "strict":
            SYSTEM_STATE["low_risk_threshold"] = 20.0
            SYSTEM_STATE["high_risk_threshold"] = 45.0
        elif req.security_tier == "permissive":
            SYSTEM_STATE["low_risk_threshold"] = 45.0
            SYSTEM_STATE["high_risk_threshold"] = 75.0
        elif req.security_tier == "standard":
            SYSTEM_STATE["low_risk_threshold"] = 35.0
            SYSTEM_STATE["high_risk_threshold"] = 65.0

    if req.low_risk_threshold is not None:
        SYSTEM_STATE["low_risk_threshold"] = req.low_risk_threshold
    if req.high_risk_threshold is not None:
        SYSTEM_STATE["high_risk_threshold"] = req.high_risk_threshold
    if req.auto_mitigation is not None:
        SYSTEM_STATE["auto_mitigation"] = req.auto_mitigation
    if req.siem_webhook_url is not None:
        SYSTEM_STATE["siem_webhook_url"] = req.siem_webhook_url

    # Update backend settings object in memory
    settings.LOW_RISK_THRESHOLD = SYSTEM_STATE["low_risk_threshold"]
    settings.HIGH_RISK_THRESHOLD = SYSTEM_STATE["high_risk_threshold"]

    return SystemSettingsSchema(
        app_name=settings.APP_NAME,
        security_tier=SYSTEM_STATE["security_tier"],
        low_risk_threshold=SYSTEM_STATE["low_risk_threshold"],
        high_risk_threshold=SYSTEM_STATE["high_risk_threshold"],
        auto_mitigation=SYSTEM_STATE["auto_mitigation"],
        siem_webhook_url=SYSTEM_STATE["siem_webhook_url"]
    )

@router.post("/watermark/embed")
async def embed_watermark_endpoint(
    file: UploadFile = File(...),
    custom_tag: Optional[str] = Form("VOICEGUARD_ENTERPRISE_AUTHENTIC_2026")
):
    """
    Embeds an inaudible high-frequency spread-spectrum acoustic watermark
    into the audio file to certify authenticity at the source.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )

    try:
        audio_data, sr, _ = load_audio_from_bytes(file_bytes, file.filename or "audio.wav", 16000)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Audio decode error: {str(e)}"
        )

    watermarked_data = embed_acoustic_watermark(audio_data, sr=sr, watermark_tag=custom_tag or "VOICEGUARD")

    # Write out as WAV
    buf = io.BytesIO()
    sf.write(buf, watermarked_data, sr, format="WAV")
    buf.seek(0)

    filename_base = os.path.splitext(file.filename or "audio")[0]
    out_filename = f"{filename_base}_watermarked.wav"

    return Response(
        content=buf.read(),
        media_type="audio/wav",
        headers={"Content-Disposition": f'attachment; filename="{out_filename}"'}
    )

@router.post("/watermark/verify", response_model=WatermarkVerifyResponse)
async def verify_watermark_endpoint(
    file: UploadFile = File(...)
):
    """
    Analyzes high-frequency carrier bands to verify presence of genuine corporate acoustic watermark.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )

    sha256_hex = hashlib.sha256(file_bytes).hexdigest()

    try:
        audio_data, sr, duration_sec = load_audio_from_bytes(file_bytes, file.filename or "audio.wav", 16000)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Audio decode error: {str(e)}"
        )

    is_wm, conf, sig_status, explanation = extract_acoustic_watermark(audio_data, sr=sr)

    return WatermarkVerifyResponse(
        is_watermarked=is_wm,
        confidence=conf,
        signature_status=sig_status,
        explanation=explanation,
        sha256_hash=sha256_hex,
        audio_duration_sec=duration_sec
    )
