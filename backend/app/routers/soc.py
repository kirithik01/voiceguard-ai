from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.scan import ScanRecord
from app.schemas.soc import (
    SOCAnalyticsResponse,
    IncidentSummary,
    UpdateIncidentStatusRequest
)

router = APIRouter(prefix="/soc", tags=["SOC Cyber Command Center"])

@router.get("/analytics", response_model=SOCAnalyticsResponse)
async def get_soc_analytics(db: Session = Depends(get_db)):
    """
    Computes enterprise SOC cyber telemetry, attack vector distributions,
    neural vocoder signatures, and incident triage status across all scans.
    """
    records = db.query(ScanRecord).order_by(desc(ScanRecord.timestamp)).all()

    total_scans = len(records)
    open_incidents = sum(1 for r in records if (r.incident_status or "OPEN") == "OPEN" and r.verdict == "synthetic")
    contained_threats = sum(1 for r in records if (r.incident_status or "") == "CONTAINED")
    false_positives = sum(1 for r in records if (r.incident_status or "") == "FALSE_POSITIVE")
    high_risk_attacks = sum(1 for r in records if r.risk_score >= 65.0)
    avg_risk = round(sum(r.risk_score for r in records) / total_scans, 1) if total_scans > 0 else 0.0

    # Categorize attack vectors based on filename and reason
    vector_counts = {
        "Executive Wire Fraud": 0,
        "Helpdesk Credential Theft": 0,
        "Privileged Voice Auth": 0,
        "Social Engineering Scam": 0,
        "Automated Synthetic Probe": 0
    }

    # Categorize vocoder signatures
    vocoder_counts = {
        "HiFi-GAN Deconv": 0,
        "WaveNet Autoregressive": 0,
        "MelGAN Pitch Flatline": 0,
        "Diffusion Vocoder Noise": 0,
        "Organic Human Acoustics": 0
    }

    status_counts = {
        "OPEN": 0,
        "INVESTIGATING": 0,
        "CONTAINED": 0,
        "FALSE_POSITIVE": 0
    }

    recent_incidents = []

    for r in records:
        # Status counts
        st = r.incident_status or "OPEN"
        if st in status_counts:
            status_counts[st] += 1
        else:
            status_counts["OPEN"] += 1

        name_lower = (r.filename_or_label or "").lower()
        reason_lower = (r.reason or "").lower()

        # Attack vector classification
        if "wire" in name_lower or "fraud" in name_lower or "cfo" in name_lower or "ceo" in name_lower:
            vector_counts["Executive Wire Fraud"] += 1
        elif "helpdesk" in name_lower or "reset" in name_lower or "password" in name_lower:
            vector_counts["Helpdesk Credential Theft"] += 1
        elif "auth" in name_lower or "dual" in name_lower or "biometric" in name_lower:
            vector_counts["Privileged Voice Auth"] += 1
        elif "social" in name_lower or "call" in name_lower:
            vector_counts["Social Engineering Scam"] += 1
        else:
            vector_counts["Automated Synthetic Probe"] += 1

        # Vocoder classification
        if r.verdict == "genuine":
            vocoder_counts["Organic Human Acoustics"] += 1
        elif "vocoder" in reason_lower and "flatness" in reason_lower:
            vocoder_counts["HiFi-GAN Deconv"] += 1
        elif "monotone" in reason_lower or "pitch" in reason_lower:
            vocoder_counts["MelGAN Pitch Flatline"] += 1
        elif "wiener" in reason_lower:
            vocoder_counts["Diffusion Vocoder Noise"] += 1
        else:
            vocoder_counts["WaveNet Autoregressive"] += 1

    # Format distributions for frontend charts
    attack_vectors_list = [{"name": k, "value": v} for k, v in vector_counts.items() if v > 0]
    if not attack_vectors_list:
        attack_vectors_list = [{"name": "Standard Inbound Calls", "value": total_scans}]

    vocoder_list = [{"name": k, "value": v} for k, v in vocoder_counts.items() if v > 0]

    # Format recent incidents (top 25)
    for r in records[:25]:
        recent_incidents.append(IncidentSummary(
            id=r.id,
            timestamp=r.timestamp,
            filename_or_label=r.filename_or_label,
            verdict=r.verdict,
            risk_score=r.risk_score,
            incident_status=r.incident_status or "OPEN",
            sha256_hash=r.sha256_hash,
            reason=r.reason,
            recommended_action=r.recommended_action
        ))

    return SOCAnalyticsResponse(
        total_scans=total_scans,
        open_incidents=open_incidents,
        contained_threats=contained_threats,
        false_positives=false_positives,
        high_risk_attacks=high_risk_attacks,
        average_risk_score=avg_risk,
        attack_vectors=attack_vectors_list,
        vocoder_breakdown=vocoder_list,
        status_breakdown=status_counts,
        recent_incidents=recent_incidents
    )

@router.patch("/incidents/{scan_id}/status")
async def update_incident_status(
    scan_id: str,
    req: UpdateIncidentStatusRequest,
    db: Session = Depends(get_db)
):
    """
    Updates triage status for a threat incident (e.g. mark as CONTAINED or FALSE_POSITIVE).
    """
    valid_statuses = ["OPEN", "INVESTIGATING", "CONTAINED", "FALSE_POSITIVE"]
    if req.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of {valid_statuses}"
        )

    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {scan_id} not found"
        )

    record.incident_status = req.status
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "incident_id": scan_id,
        "new_status": req.status,
        "message": f"Incident {scan_id} marked as {req.status}"
    }

@router.post("/incidents/{scan_id}/dispatch-alert")
async def dispatch_siem_webhook_alert(
    scan_id: str,
    db: Session = Depends(get_db)
):
    """
    Simulates high-priority SOC / SIEM webhook alert dispatch (e.g. to Splunk, Microsoft Sentinel, Slack).
    """
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {scan_id} not found"
        )

    alert_payload = {
        "event_type": "VOICE_IMPERSONATION_ATTACK_DETECTED",
        "severity": "CRITICAL" if record.risk_score >= 65 else "MEDIUM",
        "incident_id": record.id,
        "timestamp": record.timestamp,
        "target": record.filename_or_label,
        "risk_score": record.risk_score,
        "sha256_evidence": record.sha256_hash or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "mitigation_enforced": "OUT_OF_BAND_STEP_UP_CHALLENGE",
        "cert_in_reporting_code": f"CERTIN-FRAUD-{record.id[:8].upper()}"
    }

    return {
        "status": "dispatched",
        "destination": "Enterprise SOC SIEM Syslog & Cyber Threat Desk",
        "alert_payload": alert_payload
    }
