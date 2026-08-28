import json
import uuid
import hashlib
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.models.speaker import SpeakerProfile
from app.models.scan import ScanRecord
from app.schemas.speaker import SpeakerProfileSchema, DualEngineVerificationResponse
from app.schemas.scan import AnalyzeResultSchema
from app.utils.audio_processor import load_audio_from_bytes, create_audio_chunks
from app.utils.classifier import analyze_full_audio
from app.utils.voiceprint import extract_voiceprint_embedding, compare_voiceprints

router = APIRouter(prefix="/speakers", tags=["Speakers & Voiceprints"])

@router.get("", response_model=List[SpeakerProfileSchema])
async def list_speakers(db: Session = Depends(get_db)):
    """
    Lists all enrolled authorized personnel and their acoustic voiceprint baselines.
    """
    profiles = db.query(SpeakerProfile).order_by(SpeakerProfile.name.asc()).all()
    results = []
    for p in profiles:
        try:
            emb = json.loads(p.voiceprint_embedding) if p.voiceprint_embedding else {}
            pitch_hz = emb.get("pitch_mean")
        except Exception:
            pitch_hz = None

        results.append(SpeakerProfileSchema(
            id=p.id,
            name=p.name,
            role=p.role,
            department=p.department,
            created_at=p.created_at,
            sample_filename=p.sample_filename,
            baseline_pitch_hz=pitch_hz
        ))
    return results

@router.post("/enroll", response_model=SpeakerProfileSchema)
async def enroll_speaker(
    name: str = Form(...),
    role: str = Form(...),
    department: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Enrolls an authorized executive or personnel by extracting their biological vocal tract
    resonance voiceprint embedding from a voice sample.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio sample is empty"
        )

    try:
        audio_data, sr, duration_sec = load_audio_from_bytes(
            file_bytes=file_bytes,
            original_filename=file.filename or "sample.wav",
            target_sr=settings.SAMPLE_RATE
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to decode voice enrollment sample: {str(e)}"
        )

    if duration_sec < 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enrollment sample must be at least 1.0 second long"
        )

    embedding = extract_voiceprint_embedding(audio_data, sr=sr)

    speaker_id = str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()

    profile = SpeakerProfile(
        id=speaker_id,
        name=name.strip(),
        role=role.strip(),
        department=department.strip(),
        created_at=now_str,
        sample_filename=file.filename or "enrollment.wav",
        voiceprint_embedding=json.dumps(embedding)
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return SpeakerProfileSchema(
        id=profile.id,
        name=profile.name,
        role=profile.role,
        department=profile.department,
        created_at=profile.created_at,
        sample_filename=profile.sample_filename,
        baseline_pitch_hz=embedding.get("pitch_mean")
    )

@router.delete("/{speaker_id}")
async def delete_speaker(
    speaker_id: str,
    db: Session = Depends(get_db)
):
    """
    Deletes an enrolled speaker voiceprint profile.
    """
    profile = db.query(SpeakerProfile).filter(SpeakerProfile.id == speaker_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Speaker profile {speaker_id} not found"
        )

    db.delete(profile)
    db.commit()
    return {"status": "success", "message": f"Deleted voiceprint for {profile.name}"}

@router.post("/verify", response_model=DualEngineVerificationResponse)
async def verify_speaker_dual_engine(
    speaker_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Dual-Engine Verification:
    1. Anti-Spoofing Liveness Engine: Determines if audio is an AI clone or human speech.
    2. Speaker Biometric Match Engine: Compares acoustic voiceprint against enrolled executive profile.
    """
    profile = db.query(SpeakerProfile).filter(SpeakerProfile.id == speaker_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target speaker {speaker_id} not found"
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification audio is empty"
        )

    try:
        audio_data, sr, duration_sec = load_audio_from_bytes(
            file_bytes=file_bytes,
            original_filename=file.filename or "verify.wav",
            target_sr=settings.SAMPLE_RATE
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process verification audio: {str(e)}"
        )

    # 1. Anti-Spoofing Liveness Analysis
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
        filename=f"Verify vs {profile.name}",
        source_type="upload"
    )

    # 2. Speaker Biometric Voiceprint Matching
    enrolled_emb = json.loads(profile.voiceprint_embedding) if profile.voiceprint_embedding else {}
    test_emb = extract_voiceprint_embedding(audio_data, sr=sr)
    similarity_pct, match_verdict = compare_voiceprints(enrolled_emb, test_emb)

    # 3. Dual-Engine Composite Decision
    is_synthetic = analysis["verdict"] == "synthetic" or analysis["risk_score"] > settings.HIGH_RISK_THRESHOLD
    is_biometric_match = similarity_pct >= 70.0

    if is_synthetic:
        dual_verdict = "SPOOFED_CLONE"
        reason = f"🚨 DEEPFAKE CLONE DETECTED: Caller is utilizing an AI voice synthesizer targeting {profile.name} (Risk: {analysis['risk_score']}%, Biometric Match: {similarity_pct}%)."
        recommended_action = f"BLOCK IMMEDIATE AUTHORIZATION: Suspected high-profile executive impersonation attack against {profile.name}. Alert SOC and enforce Out-of-Band Physical MFA."
        incident_status = "OPEN"
    elif not is_biometric_match:
        dual_verdict = "IMPERSONATION_ATTACK"
        reason = f"⚠️ HUMAN IMPOSTOR DETECTED: Human voice verified, but vocal tract resonance mismatch with enrolled profile of {profile.name} (Biometric Match: {similarity_pct}% < 70% threshold)."
        recommended_action = f"DENY PRIVILEGED ACCESS: Caller is not {profile.name}. Escalate to Corporate Security for identity verification."
        incident_status = "INVESTIGATING"
    else:
        dual_verdict = "AUTHORIZED_AUTHENTIC"
        reason = f"✅ DUAL-ENGINE VERIFIED: Authentic human voice with confirmed acoustic voiceprint match for {profile.name} (Match: {similarity_pct}%, Liveness Risk: {analysis['risk_score']}%)."
        recommended_action = f"AUTHORIZE TRANSACTION: Verified caller matches enrolled biometric voiceprint of {profile.name} ({profile.role})."
        incident_status = "CONTAINED"

    # 4. Save to Database
    test_id = str(uuid.uuid4())
    timestamp_str = datetime.now(timezone.utc).isoformat()
    sha256_hex = hashlib.sha256(file_bytes).hexdigest()

    db_record = ScanRecord(
        id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=f"Dual-Engine: {profile.name} ({file.filename or 'audio.wav'})",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=reason,
        recommended_action=recommended_action,
        audio_duration_sec=duration_sec,
        chunk_scores=json.dumps(analysis["chunk_scores"]),
        acoustic_features=json.dumps(analysis["acoustic_features"]),
        incident_status=incident_status,
        sha256_hash=sha256_hex,
        speaker_match_score=similarity_pct,
        matched_speaker_name=profile.name
    )
    db.add(db_record)
    db.commit()

    forensic_details = AnalyzeResultSchema(
        test_id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=f"Dual-Engine: {profile.name}",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=reason,
        recommended_action=recommended_action,
        audio_duration_sec=duration_sec,
        chunk_scores=analysis["chunk_scores"],
        acoustic_features=analysis["acoustic_features"],
        incident_status=incident_status,
        sha256_hash=sha256_hex,
        speaker_match_score=similarity_pct,
        matched_speaker_name=profile.name
    )

    return DualEngineVerificationResponse(
        test_id=test_id,
        timestamp=timestamp_str,
        speaker_id=profile.id,
        speaker_name=profile.name,
        speaker_role=profile.role,
        liveness_verdict=analysis["verdict"],
        liveness_risk_score=analysis["risk_score"],
        biometric_match_verdict=match_verdict,
        biometric_similarity_pct=similarity_pct,
        dual_engine_final_verdict=dual_verdict,
        reason=reason,
        recommended_action=recommended_action,
        forensic_details=forensic_details
    )
