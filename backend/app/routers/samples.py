import os
import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.models.scan import ScanRecord
from app.schemas.scan import AnalyzeResultSchema
from app.utils.audio_processor import load_audio_from_bytes, create_audio_chunks
from app.utils.classifier import analyze_full_audio

router = APIRouter(prefix="/samples", tags=["Samples"])

class SampleMetadata(BaseModel):
    id: str
    title: str
    filename: str
    category: str
    threat_level: str
    description: str
    expected_verdict: str
    duration_sec: float
    audio_url: str

class GenerateTTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-ChristopherNeural"

class GenerateTTSResponse(BaseModel):
    result: AnalyzeResultSchema
    audio_url: str

SAMPLE_CATALOG = {
    "ceo-clone-attack": {
        "id": "ceo-clone-attack",
        "title": "CEO Impersonation Wire Fraud",
        "filename": "ceo_clone_wire_fraud.wav",
        "category": "Synthetic AI Clone",
        "threat_level": "CRITICAL",
        "description": "Simulates an urgent executive authorization attack ordering a $450,000 international wire transfer while attempting to bypass standard callback protocols.",
        "expected_verdict": "synthetic",
        "duration_sec": 5.0
    },
    "executive-human-auth": {
        "id": "executive-human-auth",
        "title": "Executive MFA Voice Verification",
        "filename": "human_executive_auth.wav",
        "category": "Authentic Human Voice",
        "threat_level": "NOMINAL",
        "description": "Natural human multi-factor verbal biometric authorization exhibiting organic vocal tract resonances, harmonic formants, and natural dynamic prosody.",
        "expected_verdict": "genuine",
        "duration_sec": 4.5
    },
    "helpdesk-social-engineering": {
        "id": "helpdesk-social-engineering",
        "title": "Helpdesk Privileged Access Attack",
        "filename": "deepfake_helpdesk_reset.wav",
        "category": "Synthetic AI Clone",
        "threat_level": "CRITICAL",
        "description": "Deepfake audio clone targeting IT helpdesk staff requesting an emergency password reset and MFA bypass for a privileged administrative account.",
        "expected_verdict": "synthetic",
        "duration_sec": 4.0
    }
}

@router.get("", response_model=List[SampleMetadata])
async def list_demo_samples():
    """
    Returns pre-packaged attack and authentication test vectors for judge demonstration.
    """
    samples = []
    for s_id, s in SAMPLE_CATALOG.items():
        samples.append(SampleMetadata(
            id=s["id"],
            title=s["title"],
            filename=s["filename"],
            category=s["category"],
            threat_level=s["threat_level"],
            description=s["description"],
            expected_verdict=s["expected_verdict"],
            duration_sec=s["duration_sec"],
            audio_url=f"/api/samples/{s['id']}/audio"
        ))
    return samples

@router.get("/{sample_id}/audio")
async def get_sample_audio(sample_id: str):
    """
    Serves sample audio WAV stream for browser playback.
    """
    if sample_id not in SAMPLE_CATALOG:
        # Check if it's a generated TTS sample
        tts_path = os.path.join(settings.SAMPLES_DIR, f"{sample_id}.mp3")
        if os.path.exists(tts_path):
            return FileResponse(tts_path, media_type="audio/mpeg")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample {sample_id} not found"
        )

    filename = SAMPLE_CATALOG[sample_id]["filename"]
    file_path = os.path.join(settings.SAMPLES_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample file {filename} does not exist on disk"
        )

    return FileResponse(file_path, media_type="audio/wav")

@router.post("/{sample_id}/run", response_model=AnalyzeResultSchema)
async def run_sample_analysis(
    sample_id: str,
    db: Session = Depends(get_db)
):
    """
    Executes forensic detection on a pre-packaged sample and persists result in database.
    """
    if sample_id not in SAMPLE_CATALOG:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample {sample_id} not found"
        )

    metadata = SAMPLE_CATALOG[sample_id]
    file_path = os.path.join(settings.SAMPLES_DIR, metadata["filename"])

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample file {metadata['filename']} missing"
        )

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    audio_data, sr, duration_sec = load_audio_from_bytes(
        file_bytes=file_bytes,
        original_filename=metadata["filename"],
        target_sr=settings.SAMPLE_RATE
    )

    chunks = create_audio_chunks(
        audio_data=audio_data,
        sr=sr,
        chunk_duration_sec=settings.CHUNK_DURATION_SEC,
        stride_sec=settings.CHUNK_STRIDE_SEC
    )

    analysis = analyze_full_audio(
        audio_data=audio_data,
        chunks=chunks,
        sr=sr,
        filename=metadata["title"],
        source_type="upload"
    )

    test_id = str(uuid.uuid4())
    timestamp_str = datetime.now(timezone.utc).isoformat()

    db_record = ScanRecord(
        id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=f"Demo: {metadata['title']}",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=analysis["reason"],
        recommended_action=analysis["recommended_action"],
        audio_duration_sec=duration_sec,
        chunk_scores=json.dumps(analysis["chunk_scores"]),
        acoustic_features=json.dumps(analysis["acoustic_features"])
    )
    db.add(db_record)
    db.commit()

    return AnalyzeResultSchema(
        test_id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=f"Demo: {metadata['title']}",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=analysis["reason"],
        recommended_action=analysis["recommended_action"],
        audio_duration_sec=duration_sec,
        chunk_scores=analysis["chunk_scores"],
        acoustic_features=analysis["acoustic_features"]
    )

@router.post("/generate-tts", response_model=GenerateTTSResponse)
async def generate_custom_tts_attack(
    req: GenerateTTSRequest,
    db: Session = Depends(get_db)
):
    """
    Synthesizes custom attacker text using neural TTS, evaluates it through
    the VoiceGuard forensic pipeline, and streams the result back in real time.
    """
    if not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt text cannot be empty"
        )

    import edge_tts
    import io

    gen_id = f"tts_{uuid.uuid4().hex[:12]}"
    mp3_path = os.path.join(settings.SAMPLES_DIR, f"{gen_id}.mp3")

    try:
        communicate = edge_tts.Communicate(req.text, req.voice or "en-US-ChristopherNeural")
        await communicate.save(mp3_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Edge-TTS synthesis failed: {str(e)}"
        )

    with open(mp3_path, "rb") as f:
        file_bytes = f.read()

    audio_data, sr, duration_sec = load_audio_from_bytes(
        file_bytes=file_bytes,
        original_filename=f"{gen_id}.mp3",
        target_sr=settings.SAMPLE_RATE
    )

    chunks = create_audio_chunks(
        audio_data=audio_data,
        sr=sr,
        chunk_duration_sec=settings.CHUNK_DURATION_SEC,
        stride_sec=settings.CHUNK_STRIDE_SEC
    )

    analysis = analyze_full_audio(
        audio_data=audio_data,
        chunks=chunks,
        sr=sr,
        filename=f"Synthesized Attack: {req.text[:30]}...",
        source_type="upload"
    )

    test_id = str(uuid.uuid4())
    timestamp_str = datetime.now(timezone.utc).isoformat()

    db_record = ScanRecord(
        id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=f"AI Synth: {req.text[:25]}...",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=analysis["reason"],
        recommended_action=analysis["recommended_action"],
        audio_duration_sec=duration_sec,
        chunk_scores=json.dumps(analysis["chunk_scores"]),
        acoustic_features=json.dumps(analysis["acoustic_features"])
    )
    db.add(db_record)
    db.commit()

    result_schema = AnalyzeResultSchema(
        test_id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=f"AI Synth: {req.text[:25]}...",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=analysis["reason"],
        recommended_action=analysis["recommended_action"],
        audio_duration_sec=duration_sec,
        chunk_scores=analysis["chunk_scores"],
        acoustic_features=analysis["acoustic_features"]
    )

    return GenerateTTSResponse(
        result=result_schema,
        audio_url=f"/api/samples/{gen_id}/audio"
    )
