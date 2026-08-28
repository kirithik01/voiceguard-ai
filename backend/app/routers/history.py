import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.scan import ScanRecord
from app.schemas.scan import HistoryItemSchema, AnalyzeResultSchema

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[HistoryItemSchema])
async def get_history(
    verdict: Optional[str] = Query(None, description="Filter by verdict: genuine, synthetic, or all"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieves threat logs and past scan history, sorted newest to oldest.
    Supports filtering by verdict.
    """
    query = db.query(ScanRecord)
    
    if verdict and verdict.lower() in ["genuine", "synthetic"]:
        query = query.filter(ScanRecord.verdict == verdict.lower())

    records = query.order_by(desc(ScanRecord.timestamp)).limit(limit).all()

    items = []
    for r in records:
        try:
            chunks = json.loads(r.chunk_scores) if r.chunk_scores else []
        except Exception:
            chunks = []

        try:
            features = json.loads(r.acoustic_features) if r.acoustic_features else None
        except Exception:
            features = None

        items.append(HistoryItemSchema(
            id=r.id,
            timestamp=r.timestamp,
            source_type=r.source_type, # type: ignore
            filename_or_label=r.filename_or_label,
            verdict=r.verdict, # type: ignore
            risk_score=r.risk_score,
            confidence=r.confidence,
            reason=r.reason,
            recommended_action=r.recommended_action,
            audio_duration_sec=r.audio_duration_sec,
            chunk_scores=chunks,
            acoustic_features=features
        ))

    return items

@router.get("/{scan_id}", response_model=AnalyzeResultSchema)
async def get_scan_by_id(
    scan_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves complete granular details for an individual scan by UUID.
    """
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with ID {scan_id} not found"
        )

    try:
        chunks = json.loads(record.chunk_scores) if record.chunk_scores else []
    except Exception:
        chunks = []

    try:
        features = json.loads(record.acoustic_features) if record.acoustic_features else None
    except Exception:
        features = None

    return AnalyzeResultSchema(
        test_id=record.id,
        timestamp=record.timestamp,
        source_type=record.source_type, # type: ignore
        filename_or_label=record.filename_or_label,
        verdict=record.verdict, # type: ignore
        risk_score=record.risk_score,
        confidence=record.confidence,
        reason=record.reason,
        recommended_action=record.recommended_action,
        audio_duration_sec=record.audio_duration_sec,
        chunk_scores=chunks,
        acoustic_features=features
    )

@router.delete("/{scan_id}")
async def delete_scan_by_id(
    scan_id: str,
    db: Session = Depends(get_db)
):
    """
    Deletes an individual scan record from threat logs.
    """
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with ID {scan_id} not found"
        )

    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Scan record {scan_id} deleted"}

@router.delete("")
async def clear_all_history(
    db: Session = Depends(get_db)
):
    """
    Clears all scan history records.
    """
    num_deleted = db.query(ScanRecord).delete()
    db.commit()
    return {"status": "success", "message": f"Cleared {num_deleted} threat scan records"}
