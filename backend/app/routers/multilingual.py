import os
import uuid
import edge_tts
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse

from app.schemas.scan import AnalyzeResultSchema
from app.utils.audio_processor import load_audio_from_bytes, create_audio_chunks
from app.utils.classifier import analyze_full_audio
from app.utils.adversarial import run_adversarial_stress_test

router = APIRouter(tags=["Multi-Lingual & Adversarial Defense"])

VERNACULAR_SAMPLES = [
    {
        "id": "hindi_police_extortion",
        "language": "Hindi (हिंदी)",
        "title": "Police Officer Digital Arrest Extortion",
        "text": "नमस्ते, मैं साइबर क्राइम सेल से इंस्पेक्टर शर्मा बोल रहा हूँ। आपके बेटे को कस्टडी में लिया गया है। तत्काल पचास हज़ार रुपये ट्रांसफर करें।",
        "voice": "hi-IN-MadhurNeural",
        "target_sector": "Digital Arrest / Extortion",
        "threat_level": "CRITICAL",
        "expected_verdict": "synthetic"
    },
    {
        "id": "tamil_bank_fraud",
        "language": "Tamil (தமிழ்)",
        "title": "Tamil Nadu State Bank Account Freeze Scam",
        "text": "வணக்கம், நான் ஸ்டேட் பாங்க் மேனேஜர் பேசுகிறேன். உங்கள் கணக்கு முடக்கப்பட்டுள்ளது, உடனடியாக உங்கள் ஓடிபி எண்ணை சொல்லுங்கள்.",
        "voice": "ta-IN-ValluvarNeural",
        "target_sector": "Commercial Banking KYC",
        "threat_level": "CRITICAL",
        "expected_verdict": "synthetic"
    },
    {
        "id": "telugu_tender_scam",
        "language": "Telugu (తెలుగు)",
        "title": "Government Secretariat Tender Authorization",
        "text": "నమస్కారం, నేను సెక్రటేరియట్ నుంచి మాట్లాడుతున్నాను. మీ కాంట్రాక్ట్ టెండర్ అప్రూవ్ కావడానికి సెక్యూరిటీ డిపాజిట్ వెంటనే చెల్లించండి.",
        "voice": "te-IN-MohanNeural",
        "target_sector": "Public Procurement Tender",
        "threat_level": "CRITICAL",
        "expected_verdict": "synthetic"
    },
    {
        "id": "hinglish_cfo_transfer",
        "language": "Hinglish (Code-Switching)",
        "title": "Hinglish Corporate Wire Transfer Demand",
        "text": "Arrey suno, this is CFO Rajesh. Offshore vendor ka payment pending hai, immediate RTGS initiate kardo right now.",
        "voice": "hi-IN-MadhurNeural",
        "target_sector": "Corporate Treasury RTGS",
        "threat_level": "CRITICAL",
        "expected_verdict": "synthetic"
    }
]

class GenerateVernacularRequest(BaseModel):
    text: str
    language: str
    voice: Optional[str] = "hi-IN-MadhurNeural"

class AdversarialStressTestResponse(BaseModel):
    is_resilient: bool
    adversarial_bypass_prevented: bool
    stages: List[Dict[str, Any]]

@router.get("/multilingual/samples")
async def get_vernacular_samples():
    """
    Returns pre-staged regional Indian language attack vectors (Hindi, Tamil, Telugu, Hinglish).
    """
    return VERNACULAR_SAMPLES

@router.post("/multilingual/generate-vernacular")
async def generate_vernacular_clone(req: GenerateVernacularRequest):
    """
    Synthesizes regional Indian language voice clone in real-time via neural TTS
    and executes instant multi-lingual forensic analysis.
    """
    if not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt text cannot be empty"
        )

    os.makedirs("samples", exist_ok=True)
    temp_filename = f"vernacular_{uuid.uuid4().hex[:8]}.mp3"
    temp_path = os.path.join("samples", temp_filename)

    try:
        communicate = edge_tts.Communicate(text=req.text, voice=req.voice or "hi-IN-MadhurNeural")
        await communicate.save(temp_path)

        with open(temp_path, "rb") as f:
            audio_bytes = f.read()

        audio_data, sr, duration_sec = load_audio_from_bytes(audio_bytes, temp_filename, 16000)
        chunks = create_audio_chunks(audio_data, sr, chunk_duration_sec=3.0, stride_sec=1.5)
        analysis = analyze_full_audio(
            audio_data,
            chunks,
            sr,
            filename=f"Vernacular [{req.language}]: {req.text[:25]}...",
            source_type="upload"
        )

        return {
            "result": analysis,
            "audio_url": f"/api/multilingual/audio/{temp_filename}",
            "language": req.language,
            "voice": req.voice
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vernacular synthesis failed: {str(e)}"
        )

@router.get("/multilingual/audio/{filename}")
async def get_vernacular_audio(filename: str):
    """
    Streams synthesized vernacular audio file.
    """
    filepath = os.path.join("samples", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio file not found")
    return FileResponse(filepath, media_type="audio/mpeg")

@router.post("/adversarial/stress-test", response_model=AdversarialStressTestResponse)
async def run_adversarial_evaluation(
    noise_level: float = Form(0.20),
    tempo_factor: float = Form(1.10),
    sample_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Tests VoiceGuard's built-in Adaptive Spectral Denoising pre-filter against adversarial evasion
    (ambient background noise injection and time-stretching).
    """
    audio_bytes = None
    if file:
        audio_bytes = await file.read()
    elif sample_id:
        sample_path = os.path.join("samples", f"{sample_id}.wav")
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                audio_bytes = f.read()

    if not audio_bytes:
        # Default to CEO wire fraud clone
        fallback_path = os.path.join("samples", "ceo_clone_wire_fraud.wav")
        if os.path.exists(fallback_path):
            with open(fallback_path, "rb") as f:
                audio_bytes = f.read()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No audio provided for adversarial stress test"
            )

    audio_data, sr, _ = load_audio_from_bytes(audio_bytes, "adversarial_input.wav", 16000)
    result = run_adversarial_stress_test(
        audio=audio_data,
        sr=sr,
        noise_level=noise_level,
        tempo_factor=tempo_factor
    )
    return result
