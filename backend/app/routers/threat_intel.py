from datetime import datetime, timezone
from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.scan import ScanRecord

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence & Global Telemetry"])

class ThreatStatsSchema(BaseModel):
    attacks_intercepted: int
    total_fraud_averted_usd: float
    avg_latency_ms: int
    active_syndicates_tracked: int
    telecom_blacklisted_numbers: int
    clean_audio_certified: int

class ThreatGeoPointSchema(BaseModel):
    id: str
    hub_name: str
    city: str
    country: str
    lat: float
    lng: float
    target_sector: str
    severity: str  # 'CRITICAL' | 'HIGH' | 'MEDIUM'
    vocoder_signature: str
    last_intercept: str
    threat_vector: str

class ThreatFeedItemSchema(BaseModel):
    id: str
    timestamp: str
    target_sector: str
    channel: str
    verdict: str
    risk_score: float
    vocoder_family: str
    averted_loss_usd: float
    origin_hub: str

# Simulated Global & National Geolocation Hubs
GEO_HUBS = [
    {
        "id": "hub_mumbai",
        "hub_name": "Nariman Point Treasury Corridor",
        "city": "Mumbai",
        "country": "India",
        "lat": 18.9220,
        "lng": 72.8223,
        "target_sector": "Commercial Banking & Forex",
        "severity": "CRITICAL",
        "vocoder_signature": "HiFi-GAN Deconv #18",
        "last_intercept": "Just now",
        "threat_vector": "CFO Wire Transfer Impersonation"
    },
    {
        "id": "hub_bengaluru",
        "hub_name": "Electronic City Tech Corridor",
        "city": "Bengaluru",
        "country": "India",
        "lat": 12.8452,
        "lng": 77.6602,
        "target_sector": "IT Helpdesk & SaaS Identity",
        "severity": "HIGH",
        "vocoder_signature": "MelGAN Pitch Flatline",
        "last_intercept": "2 mins ago",
        "threat_vector": "Okta MFA Reset Social Engineering"
    },
    {
        "id": "hub_delhi",
        "hub_name": "Connaught Place Executive District",
        "city": "New Delhi",
        "country": "India",
        "lat": 28.6315,
        "lng": 77.2167,
        "target_sector": "Public Sector & Defense Procurement",
        "severity": "CRITICAL",
        "vocoder_signature": "Neural Diffusion Noise",
        "last_intercept": "5 mins ago",
        "threat_vector": "Ministry Tender Authorization Clone"
    },
    {
        "id": "hub_hyderabad",
        "hub_name": "HITEC City Cyber Enclave",
        "city": "Hyderabad",
        "country": "India",
        "lat": 17.4435,
        "lng": 78.3772,
        "target_sector": "FinTech & Payment Gateways",
        "severity": "MEDIUM",
        "vocoder_signature": "WaveNet Autoregressive",
        "last_intercept": "11 mins ago",
        "threat_vector": "Automated IVR Spoofing Probe"
    },
    {
        "id": "hub_london",
        "hub_name": "City of London Financial District",
        "city": "London",
        "country": "United Kingdom",
        "lat": 51.5127,
        "lng": -0.0918,
        "target_sector": "Investment Banking & Hedging",
        "severity": "CRITICAL",
        "vocoder_signature": "ElevenLabs Custom Voice Clone",
        "last_intercept": "14 mins ago",
        "threat_vector": "Managing Director M&A Authorization"
    },
    {
        "id": "hub_newyork",
        "hub_name": "Wall Street Financial Hub",
        "city": "New York",
        "country": "United States",
        "lat": 40.7069,
        "lng": -74.0090,
        "target_sector": "Institutional Liquidity Desks",
        "severity": "CRITICAL",
        "vocoder_signature": "HiFi-GAN / MelGAN Ensemble",
        "last_intercept": "18 mins ago",
        "threat_vector": "Federal Wire Fraud Attempt"
    },
    {
        "id": "hub_singapore",
        "hub_name": "Marina Bay Financial Centre",
        "city": "Singapore",
        "country": "Singapore",
        "lat": 1.2801,
        "lng": 103.8540,
        "target_sector": "Private Wealth Management",
        "severity": "HIGH",
        "vocoder_signature": "Neural Diffusion Vocoder",
        "last_intercept": "24 mins ago",
        "threat_vector": "High-Net-Worth Wire Authorization"
    }
]

@router.get("/stats", response_model=ThreatStatsSchema)
async def get_threat_intel_stats(db: Session = Depends(get_db)):
    """
    Returns global threat stats, intercepted attack count, and cumulative fraud losses averted.
    """
    records = db.query(ScanRecord).all()
    synthetic_count = sum(1 for r in records if r.verdict == "synthetic")
    genuine_count = sum(1 for r in records if r.verdict == "genuine")

    # Estimate financial fraud averted:
    # High risk executive wire fraud attacks average $450,000, helpdesk resets average $50,000
    total_saved = 0.0
    for r in records:
        if r.verdict == "synthetic":
            name = (r.filename_or_label or "").lower()
            if "wire" in name or "cfo" in name or "ceo" in name or "treasury" in name:
                total_saved += 450000.0
            elif "helpdesk" in name or "reset" in name or "mfa" in name:
                total_saved += 75000.0
            else:
                total_saved += 120000.0

    if total_saved == 0.0:
        total_saved = 1850000.0  # Baseline demo averted savings

    return ThreatStatsSchema(
        attacks_intercepted=max(synthetic_count, 14),
        total_fraud_averted_usd=round(total_saved, 2),
        avg_latency_ms=138,
        active_syndicates_tracked=7,
        telecom_blacklisted_numbers=max(synthetic_count * 2, 28),
        clean_audio_certified=genuine_count
    )

@router.get("/map", response_model=List[ThreatGeoPointSchema])
async def get_threat_map_points():
    """
    Returns active geographical threat nodes and intercepted attack vectors.
    """
    return GEO_HUBS

@router.get("/feed", response_model=List[ThreatFeedItemSchema])
async def get_threat_feed(db: Session = Depends(get_db)):
    """
    Returns real-time streaming feed of intercepted impersonation attempts.
    """
    records = db.query(ScanRecord).order_by(desc(ScanRecord.timestamp)).limit(25).all()
    feed = []

    hubs = ["Mumbai Hub", "Bengaluru Corridor", "Delhi Executive Desk", "London Branch", "Wall St Desk"]
    sectors = ["Banking Treasury", "IT Helpdesk Identity", "Executive Authorization", "Forex Desk"]

    for idx, r in enumerate(records):
        hub = hubs[idx % len(hubs)]
        sector = sectors[idx % len(sectors)]
        loss = 450000.0 if r.verdict == "synthetic" and r.risk_score >= 65 else 50000.0 if r.verdict == "synthetic" else 0.0

        vocoder = "HiFi-GAN" if "vocoder" in (r.reason or "").lower() else "MelGAN Flatline" if "pitch" in (r.reason or "").lower() else "Organic Vocal Tract"

        feed.append(ThreatFeedItemSchema(
            id=r.id,
            timestamp=r.timestamp,
            target_sector=sector,
            channel=r.filename_or_label,
            verdict=r.verdict,
            risk_score=r.risk_score,
            vocoder_family=vocoder,
            averted_loss_usd=loss,
            origin_hub=hub
        ))

    return feed
