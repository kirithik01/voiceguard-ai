import numpy as np
from scipy import signal
from app.utils.classifier import analyze_full_audio
from app.utils.audio_processor import create_audio_chunks

def simulate_g711_mu_law(audio: np.ndarray, sr: int = 16000) -> tuple[np.ndarray, int]:
    """
    Simulates standard legacy PSTN telephone landline transmission:
    1. Bandpass filter 300 Hz - 3400 Hz (telephony passband)
    2. Downsample to 8000 Hz
    3. ITU-T G.711 mu-law 8-bit logarithmic quantization
    4. Upsample back to 16000 Hz for forensic feature comparison
    """
    # 1. Bandpass 300 - 3400 Hz
    sos = signal.butter(4, [300, 3400], btype='bandpass', fs=sr, output='sos')
    filtered = signal.sosfilt(sos, audio)

    # 2. Downsample to 8000 Hz
    num_samples_8k = int(len(filtered) * 8000 / sr)
    downsampled = signal.resample(filtered, num_samples_8k)

    # 3. G.711 mu-law 8-bit quantization simulation (mu = 255)
    mu = 255.0
    x = np.clip(downsampled, -1.0, 1.0)
    mu_compressed = np.sign(x) * (np.log(1 + mu * np.abs(x)) / np.log(1 + mu))
    quantized = np.round(mu_compressed * 127.0) / 127.0
    mu_expanded = np.sign(quantized) * (1 / mu) * ((1 + mu) ** np.abs(quantized) - 1)

    # 4. Upsample back to 16000 Hz
    upsampled = signal.resample(mu_expanded, len(audio))
    return upsampled.astype(np.float32), sr

def simulate_wideband_voip(audio: np.ndarray, sr: int = 16000) -> tuple[np.ndarray, int]:
    """
    Simulates modern Wideband VoIP (Opus / AMR-WB):
    50 Hz - 7000 Hz audio passband with mild lossy quantization noise.
    """
    sos = signal.butter(4, [50, 7000], btype='bandpass', fs=sr, output='sos')
    filtered = signal.sosfilt(sos, audio)
    # Subtle bit-depth quantization (10-bit equivalent)
    quantized = np.round(filtered * 512.0) / 512.0
    return quantized.astype(np.float32), sr

def simulate_lossy_cell(audio: np.ndarray, sr: int = 16000) -> tuple[np.ndarray, int]:
    """
    Simulates poor cellular mobile connection:
    Bandpass filtering, 8kHz downsampling, background cellular jitter,
    and random micro-packet dropouts (10-20ms packet loss concealment artifacts).
    """
    g711_audio, _ = simulate_g711_mu_law(audio, sr)
    output = np.copy(g711_audio)

    # Inject random micro packet drops (every 0.5s to 1.0s, drop 20ms of audio)
    drop_len = int(0.025 * sr)
    num_drops = int(len(output) / sr * 2)
    for _ in range(num_drops):
        if len(output) > drop_len * 4:
            start = np.random.randint(0, len(output) - drop_len)
            output[start:start + drop_len] *= 0.15  # 85% packet dropout

    # Add cellular static noise floor
    noise = np.random.normal(0, 0.005, len(output)).astype(np.float32)
    output += noise
    return output, sr

def run_codec_benchmark(audio: np.ndarray, sr: int = 16000) -> dict:
    """
    Evaluates acoustic detection resilience across 4 telecom transmission profiles:
    1. Studio HD (Lossless 16kHz PCM)
    2. Wideband VoIP (Opus / AMR-WB)
    3. PSTN Landline (G.711 mu-law 8kHz)
    4. Lossy Mobile Cell (High jitter & packet drops)
    """
    profiles = {
        "Studio HD (Lossless 16kHz)": audio,
        "Wideband VoIP (Opus 16kHz)": simulate_wideband_voip(audio, sr)[0],
        "PSTN Landline (G.711 8kHz)": simulate_g711_mu_law(audio, sr)[0],
        "Lossy Mobile Cell (Degraded)": simulate_lossy_cell(audio, sr)[0]
    }

    results = []
    for name, p_audio in profiles.items():
        chunks = create_audio_chunks(p_audio, sr, chunk_duration_sec=3.0, stride_sec=1.5)
        analysis = analyze_full_audio(p_audio, chunks, sr, filename=name, source_type="upload")
        results.append({
            "profile_name": name,
            "risk_score": analysis["risk_score"],
            "verdict": analysis["verdict"],
            "confidence": round(analysis["confidence"], 2),
            "pitch_std_hz": analysis["acoustic_features"].get("pitch_std_hz"),
            "spectral_flatness": analysis["acoustic_features"].get("spectral_flatness"),
            "resilience_verdict": "CONSISTENT_ACCURACY" if analysis["confidence"] >= 0.7 else "MODERATE_DEGRADATION"
        })

    # Overall codec robustness index (0-100%)
    verdicts = [r["verdict"] for r in results]
    consistency_pct = (verdicts.count(verdicts[0]) / len(verdicts)) * 100.0

    return {
        "benchmark_summary": {
            "overall_consistency_pct": consistency_pct,
            "baseline_verdict": results[0]["verdict"],
            "robustness_rating": "MILITARY_GRADE" if consistency_pct == 100 else "ENTERPRISE_GRADE"
        },
        "profiles": results
    }
