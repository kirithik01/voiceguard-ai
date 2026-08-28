import json
import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.models.scan import ScanRecord
from app.schemas.scan import AnalyzeResultSchema
from app.utils.audio_processor import load_audio_from_bytes, create_audio_chunks
from app.utils.classifier import analyze_full_audio, score_audio_chunk

router = APIRouter(prefix="/analyze", tags=["Analyze"])

@router.post("/file", response_model=AnalyzeResultSchema)
async def analyze_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded audio file (.wav, .mp3, .m4a, .ogg, .flac), performs
    temporal sliding-window forensic analysis, extracts vocoder acoustic signatures,
    persists scan record into the database, and returns the complete forensic verdict.
    """
    # 1. Read file bytes
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )

    # 2. Check maximum size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
        )

    # 3. Decode & resample audio
    try:
        audio_data, sr, duration_sec = load_audio_from_bytes(
            file_bytes=file_bytes,
            original_filename=file.filename or "audio.wav",
            target_sr=settings.SAMPLE_RATE
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to decode audio: {str(e)}"
        )

    # 4. Generate temporal chunks
    chunks = create_audio_chunks(
        audio_data=audio_data,
        sr=sr,
        chunk_duration_sec=settings.CHUNK_DURATION_SEC,
        stride_sec=settings.CHUNK_STRIDE_SEC
    )

    # 5. Execute deep forensic & acoustic analysis
    analysis = analyze_full_audio(
        audio_data=audio_data,
        chunks=chunks,
        sr=sr,
        filename=file.filename or "unknown.wav",
        source_type="upload"
    )

    # 6. Save scan record in DB
    test_id = str(uuid.uuid4())
    timestamp_str = datetime.now(timezone.utc).isoformat()
    sha256_hex = hashlib.sha256(file_bytes).hexdigest()
    incident_status = "OPEN" if analysis["verdict"] == "synthetic" else "CONTAINED"

    db_record = ScanRecord(
        id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=file.filename or "upload.wav",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=analysis["reason"],
        recommended_action=analysis["recommended_action"],
        audio_duration_sec=duration_sec,
        chunk_scores=json.dumps(analysis["chunk_scores"]),
        acoustic_features=json.dumps(analysis["acoustic_features"]),
        incident_status=incident_status,
        sha256_hash=sha256_hex
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return AnalyzeResultSchema(
        test_id=test_id,
        timestamp=timestamp_str,
        source_type="upload",
        filename_or_label=file.filename or "upload.wav",
        verdict=analysis["verdict"],
        risk_score=analysis["risk_score"],
        confidence=analysis["confidence"],
        reason=analysis["reason"],
        recommended_action=analysis["recommended_action"],
        audio_duration_sec=duration_sec,
        chunk_scores=analysis["chunk_scores"],
        acoustic_features=analysis["acoustic_features"],
        incident_status=incident_status,
        sha256_hash=sha256_hex
    )

@router.post("/live-chunk", response_model=AnalyzeResultSchema)
async def analyze_live_chunk(
    chunk: UploadFile = File(...),
    chunk_index: int = Form(...),
    is_final: bool = Form(False),
    db: Session = Depends(get_db)
):
    """
    Accepts real-time streaming audio chunk from microphone stream,
    processes sliding forensic score, and persists final result.
    """
    chunk_bytes = await chunk.read()
    if not chunk_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chunk audio is empty"
        )

    try:
        audio_data, sr, duration_sec = load_audio_from_bytes(
            file_bytes=chunk_bytes,
            original_filename=chunk.filename or "chunk.webm",
            target_sr=settings.SAMPLE_RATE
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to decode chunk audio: {str(e)}"
        )

    start_sec = chunk_index * settings.CHUNK_STRIDE_SEC
    end_sec = start_sec + duration_sec

    # Score single chunk
    chunk_score = score_audio_chunk(
        chunk_data=audio_data,
        sr=sr,
        chunk_index=chunk_index,
        start_sec=round(start_sec, 2),
        end_sec=round(end_sec, 2)
    )

    test_id = str(uuid.uuid4())
    timestamp_str = datetime.now(timezone.utc).isoformat()

    reason = (
        "Live audio chunk evaluation: neural vocoder resonance and pitch frequency evaluated."
        if chunk_score["label"] == "genuine"
        else "Elevated synthetic signature detected in incoming stream chunk."
    )

    recommended_action = (
        "✅ Active call stream is nominal."
        if chunk_score["label"] == "genuine"
        else "🚨 Step-up authentication challenge recommended."
    )

    # If final chunk, persist into database
    if is_final:
        db_record = ScanRecord(
            id=test_id,
            timestamp=timestamp_str,
            source_type="live",
            filename_or_label=f"Live Call #{chunk_index + 1}",
            verdict=chunk_score["label"],
            risk_score=chunk_score["risk_score"],
            confidence=chunk_score["confidence"],
            reason=reason,
            recommended_action=recommended_action,
            audio_duration_sec=duration_sec,
            chunk_scores=json.dumps([chunk_score]),
            acoustic_features=json.dumps({})
        )
        db.add(db_record)
        db.commit()

    return AnalyzeResultSchema(
        test_id=test_id,
        timestamp=timestamp_str,
        source_type="live",
        filename_or_label=f"Live Stream Chunk #{chunk_index}",
        verdict=chunk_score["label"],
        risk_score=chunk_score["risk_score"],
        confidence=chunk_score["confidence"],
        reason=reason,
        recommended_action=recommended_action,
        audio_duration_sec=duration_sec,
        chunk_scores=[chunk_score],
        acoustic_features=None
    )
