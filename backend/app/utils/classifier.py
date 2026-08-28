import numpy as np
from app.config import settings
from app.utils.forensics import (
    compute_spectral_flatness,
    compute_pitch_f0,
    compute_neural_vocoder_artifact_score,
    extract_all_acoustic_features
)

def score_audio_chunk(chunk_data: np.ndarray, sr: int = settings.SAMPLE_RATE, chunk_index: int = 0, start_sec: float = 0.0, end_sec: float = 4.0) -> dict:
    """
    Scores a single temporal chunk of audio.
    Returns dictionary matching ChunkScoreSchema:
    {
        'chunk_index': int,
        'start_sec': float,
        'end_sec': float,
        'label': 'genuine' | 'synthetic',
        'confidence': float,
        'risk_score': float
    }
    """
    if len(chunk_data) == 0:
        return {
            "chunk_index": chunk_index,
            "start_sec": start_sec,
            "end_sec": end_sec,
            "label": "genuine",
            "confidence": 0.5,
            "risk_score": 20.0
        }

    flatness = compute_spectral_flatness(chunk_data)
    _, pitch_std, _ = compute_pitch_f0(chunk_data, sr=sr)

    # Base chunk risk calculation
    chunk_risk = 25.0

    # Adjust risk based on forensic markers
    if flatness > 0.08:
        chunk_risk += 45.0
    elif flatness > 0.045:
        chunk_risk += 35.0
    elif flatness > 0.025:
        chunk_risk += 20.0
    elif flatness <= 0.025:
        chunk_risk -= 10.0

    if pitch_std < 5.0:
        chunk_risk += 48.0  # Extremely monotone robotic pitch
    elif pitch_std < 12.0:
        chunk_risk += 30.0
    elif pitch_std < 18.0:
        chunk_risk += 15.0
    elif pitch_std > 26.0 and flatness <= 0.05:
        chunk_risk -= 15.0

    # Ensure bounds 5 to 98
    chunk_risk = float(np.clip(chunk_risk, 5.0, 98.0))
    chunk_risk = round(chunk_risk, 1)

    label = "synthetic" if chunk_risk >= settings.HIGH_RISK_THRESHOLD else "genuine"
    
    # Confidence is distance from threshold boundary
    if chunk_risk >= settings.HIGH_RISK_THRESHOLD:
        confidence = 0.70 + 0.28 * min(1.0, (chunk_risk - settings.HIGH_RISK_THRESHOLD) / (100.0 - settings.HIGH_RISK_THRESHOLD))
    elif chunk_risk <= settings.LOW_RISK_THRESHOLD:
        confidence = 0.70 + 0.28 * min(1.0, (settings.LOW_RISK_THRESHOLD - chunk_risk) / settings.LOW_RISK_THRESHOLD)
    else:
        confidence = 0.55 + 0.15 * abs(chunk_risk - 50.0) / 15.0

    return {
        "chunk_index": chunk_index,
        "start_sec": start_sec,
        "end_sec": end_sec,
        "label": label,
        "confidence": round(float(confidence), 2),
        "risk_score": chunk_risk
    }

def analyze_full_audio(
    audio_data: np.ndarray,
    chunks: list[dict],
    sr: int = settings.SAMPLE_RATE,
    filename: str = "audio.wav",
    source_type: str = "upload"
) -> dict:
    """
    Aggregates whole-file analysis across all temporal chunks and holistic acoustic features.
    """
    # 1. Holistic acoustic feature extraction
    acoustic_features = extract_all_acoustic_features(audio_data, sr=sr)

    # 2. Score individual chunks
    chunk_scores = []
    for chunk in chunks:
        score_res = score_audio_chunk(
            chunk_data=chunk["data"],
            sr=sr,
            chunk_index=chunk["chunk_index"],
            start_sec=chunk["start_sec"],
            end_sec=chunk["end_sec"]
        )
        chunk_scores.append(score_res)

    # 3. Aggregate risk score
    # We weight both the peak suspicious chunks and the holistic vocoder artifact score
    if chunk_scores:
        avg_chunk_risk = float(np.mean([c["risk_score"] for c in chunk_scores]))
        max_chunk_risk = float(np.max([c["risk_score"] for c in chunk_scores]))
        # An attack might only clone a segment (e.g. key phrase), so max chunk has strong influence
        temporal_risk = 0.6 * avg_chunk_risk + 0.4 * max_chunk_risk
    else:
        temporal_risk = 20.0

    vocoder_risk = acoustic_features["neural_vocoder_artifact_score"]
    
    # Combined score
    final_risk = 0.5 * temporal_risk + 0.5 * vocoder_risk
    final_risk = float(np.clip(final_risk, 4.0, 99.0))
    final_risk = round(final_risk, 1)

    # Verdict
    if final_risk >= settings.HIGH_RISK_THRESHOLD:
        verdict = "synthetic"
    elif final_risk <= settings.LOW_RISK_THRESHOLD:
        verdict = "genuine"
    else:
        # Borderline: if vocoder score is high, lean synthetic
        verdict = "synthetic" if vocoder_risk > 55.0 else "genuine"

    # Confidence calculation
    if final_risk >= settings.HIGH_RISK_THRESHOLD:
        confidence = 0.75 + 0.23 * min(1.0, (final_risk - settings.HIGH_RISK_THRESHOLD) / (100.0 - settings.HIGH_RISK_THRESHOLD))
    elif final_risk <= settings.LOW_RISK_THRESHOLD:
        confidence = 0.75 + 0.23 * min(1.0, (settings.LOW_RISK_THRESHOLD - final_risk) / settings.LOW_RISK_THRESHOLD)
    else:
        confidence = 0.62 + 0.15 * abs(final_risk - 50.0) / 15.0

    confidence = round(float(confidence), 2)

    # Reason generation based on forensic evidence
    reasons = []
    flatness = acoustic_features["spectral_flatness"]
    pitch_std = acoustic_features["pitch_std_hz"]
    vocoder_score = acoustic_features["neural_vocoder_artifact_score"]

    if verdict == "synthetic":
        if vocoder_score >= 60.0:
            reasons.append(f"Pronounced neural vocoder synthesis signature detected (Score: {vocoder_score}/100)")
        if flatness > 0.035:
            reasons.append(f"Unnatural high-frequency Wiener spectral flatness ({flatness} vs human baseline <0.025)")
        if pitch_std < 15.0:
            reasons.append(f"Severely restricted prosodic dynamic range (Pitch std dev: {pitch_std} Hz, indicating robotic monotone inflection)")
        if not reasons:
            reasons.append("High probability of AI speech synthesis model detected across temporal chunk windows")
        reason = " | ".join(reasons)
        recommended_action = (
            "🚨 CRITICAL THREAT INTERCEPT: Synthetic voice clone detected. "
            "Drop the ongoing session, enforce Step-Up Out-of-Band MFA / Voice Challenge Passphrase, "
            "and flag account credentials for immediate fraud review."
        )
    else:
        if pitch_std >= 18.0:
            reasons.append(f"Normal human prosodic variance confirmed (Pitch std dev: {pitch_std} Hz)")
        if flatness <= 0.03:
            reasons.append(f"Organic vocal tract harmonic resonances present (Spectral flatness: {flatness})")
        if not reasons:
            reasons.append("Acoustic parameters align with biological human vocal tract acoustics")
        reason = " | ".join(reasons)
        recommended_action = (
            "✅ PASS: Acoustic markers verify natural human speech. "
            "No voice cloning artifacts found. Safe to proceed with normal authorization flow."
        )

    return {
        "verdict": verdict,
        "risk_score": final_risk,
        "confidence": confidence,
        "reason": reason,
        "recommended_action": recommended_action,
        "chunk_scores": chunk_scores,
        "acoustic_features": acoustic_features
    }
