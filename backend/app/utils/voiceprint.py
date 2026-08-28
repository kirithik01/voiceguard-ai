import json
import numpy as np
from scipy import signal
from app.utils.forensics import compute_pitch_f0, compute_spectral_centroid, compute_spectral_flatness

def extract_voiceprint_embedding(audio: np.ndarray, sr: int = 16000) -> dict:
    """
    Extracts an acoustic biometric voiceprint embedding representing an individual's
    unique vocal tract resonance bands and fundamental frequency profile.
    """
    if len(audio) < int(0.5 * sr):
        # Default fallback if too short
        return {
            "pitch_mean": 160.0,
            "pitch_std": 25.0,
            "spectral_centroid": 1800.0,
            "resonance_vector": [0.25] * 8
        }

    pitch_mean, pitch_std, _ = compute_pitch_f0(audio, sr=sr)
    centroid = compute_spectral_centroid(audio, sr=sr)
    flatness = compute_spectral_flatness(audio)

    # Compute STFT magnitude spectrum
    f, t, Zxx = signal.stft(audio, fs=sr, nperseg=1024, noverlap=512)
    mag = np.mean(np.abs(Zxx), axis=1)

    # 8 Acoustic Formant Frequency Resonance Bands:
    # 0: 100-300 Hz (Fundamental bass)
    # 1: 300-600 Hz (First formant F1 low)
    # 2: 600-1000 Hz (First formant F1 high)
    # 3: 1000-1800 Hz (Second formant F2 low)
    # 4: 1800-2600 Hz (Second formant F2 high)
    # 5: 2600-3600 Hz (Third formant F3 low)
    # 6: 3600-5000 Hz (Third formant F3 high)
    # 7: 5000-8000 Hz (High frequency resonance)
    band_limits = [
        (100, 300),
        (300, 600),
        (600, 1000),
        (1000, 1800),
        (1800, 2600),
        (2600, 3600),
        (3600, 5000),
        (5000, 8000)
    ]

    vector = []
    total_energy = np.sum(mag) + 1e-10

    for low, high in band_limits:
        mask = (f >= low) & (f < high)
        band_energy = np.sum(mag[mask]) if np.any(mask) else 0.0
        vector.append(float(band_energy / total_energy))

    # Normalize vector
    v_norm = np.linalg.norm(vector) + 1e-10
    norm_vector = [round(float(x / v_norm), 4) for x in vector]

    return {
        "pitch_mean": round(float(pitch_mean), 1),
        "pitch_std": round(float(pitch_std), 1),
        "spectral_centroid": round(float(centroid), 1),
        "spectral_flatness": round(float(flatness), 4),
        "resonance_vector": norm_vector
    }

def compare_voiceprints(enrolled_embedding: dict, test_embedding: dict) -> tuple[float, str]:
    """
    Computes biometric similarity percentage (0.0 to 100.0%) between an enrolled
    voiceprint profile and a test audio recording.
    Returns (similarity_percentage, match_label).
    """
    v_enrolled = np.array(enrolled_embedding.get("resonance_vector", [0.1] * 8), dtype=np.float32)
    v_test = np.array(test_embedding.get("resonance_vector", [0.1] * 8), dtype=np.float32)

    # 1. Cosine similarity of vocal tract resonance bands (0 to 1)
    cos_sim = float(np.dot(v_enrolled, v_test) / ((np.linalg.norm(v_enrolled) * np.linalg.norm(v_test)) + 1e-10))
    cos_sim = float(np.clip(cos_sim, 0.0, 1.0))

    # 2. Pitch proximity penalty
    p_enrolled = enrolled_embedding.get("pitch_mean", 160.0)
    p_test = test_embedding.get("pitch_mean", 160.0)
    pitch_diff_ratio = abs(p_enrolled - p_test) / (p_enrolled + 1e-5)
    pitch_factor = max(0.0, 1.0 - min(1.0, pitch_diff_ratio * 1.5))

    # 3. Overall similarity calculation
    similarity_score = (0.75 * cos_sim + 0.25 * pitch_factor) * 100.0
    similarity_score = round(float(np.clip(similarity_score, 10.0, 99.5)), 1)

    # Match threshold: >= 70% is confirmed biometric match
    if similarity_score >= 75.0:
        match_label = "MATCH_CONFIRMED"
    elif similarity_score >= 60.0:
        match_label = "INCONCLUSIVE_MATCH"
    else:
        match_label = "IMPOSTOR_MISMATCH"

    return similarity_score, match_label
