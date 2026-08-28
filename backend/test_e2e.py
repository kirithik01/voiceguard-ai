import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app

def generate_human_like_audio():
    """Generates audio with rich harmonic vibrato and natural prosodic pitch dynamic variation."""
    sr = 16000
    duration = 4.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Dynamic F0 varying naturally between 140Hz and 220Hz
    f0 = 175.0 + 35.0 * np.sin(2 * np.pi * 1.5 * t) + 10.0 * np.cos(2 * np.pi * 4.2 * t)
    phase = 2 * np.pi * np.cumsum(f0) / sr
    # Formants & harmonics
    wave = 0.5 * np.sin(phase) + 0.25 * np.sin(2 * phase) + 0.12 * np.sin(3 * phase)
    # Amplitude envelope
    envelope = 0.5 * (1 + np.sin(2 * np.pi * 0.8 * t))
    audio = (wave * envelope).astype(np.float32)
    
    buf = io.BytesIO()
    sf.write(buf, audio, sr, format='WAV')
    buf.seek(0)
    return buf

def generate_synthetic_like_audio():
    """Generates audio with flat monotone pitch and elevated high-frequency vocoder noise."""
    sr = 16000
    duration = 4.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Rigid monotone pitch (std dev < 3 Hz)
    f0 = 180.0 + 0.8 * np.sin(2 * np.pi * 0.5 * t)
    phase = 2 * np.pi * np.cumsum(f0) / sr
    # Synthetic waveform + high frequency deconvolution noise floor
    tone = 0.5 * np.sin(phase)
    noise = 0.4 * np.random.normal(0, 0.25, len(t))
    audio = (tone + noise).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format='WAV')
    buf.seek(0)
    return buf

def run_e2e():
    with TestClient(app) as client:
        print("[E2E] Testing Human-like audio upload...")
        human_buf = generate_human_like_audio()
        res_human = client.post(
            "/api/analyze/file",
            files={"file": ("human_executive_call.wav", human_buf, "audio/wav")}
        )
        assert res_human.status_code == 200, f"Error: {res_human.text}"
        data_human = res_human.json()
        print(f" -> Human Scan: Verdict={data_human['verdict']}, Risk={data_human['risk_score']}%, Chunks={len(data_human['chunk_scores'])}")
        assert data_human["verdict"] == "genuine", f"Expected genuine, got {data_human['verdict']}"
        assert data_human["risk_score"] < 35.0, f"Expected risk < 35, got {data_human['risk_score']}"

        print("\n[E2E] Testing Synthetic-like audio upload...")
        synth_buf = generate_synthetic_like_audio()
        res_synth = client.post(
            "/api/analyze/file",
            files={"file": ("cloned_ceo_voice_attack.wav", synth_buf, "audio/wav")}
        )
        assert res_synth.status_code == 200, f"Error: {res_synth.text}"
        data_synth = res_synth.json()
        print(f" -> Synthetic Scan: Verdict={data_synth['verdict']}, Risk={data_synth['risk_score']}%, Chunks={len(data_synth['chunk_scores'])}")
        assert data_synth["verdict"] == "synthetic", f"Expected synthetic, got {data_synth['verdict']}"
        assert data_synth["risk_score"] > 65.0, f"Expected risk > 65, got {data_synth['risk_score']}"

        print("\n[E2E] Testing History retrieval & filtering...")
        hist_all = client.get("/api/history").json()
        print(f" -> Total History Records: {len(hist_all)}")
        assert len(hist_all) >= 2

        hist_synth = client.get("/api/history?verdict=synthetic").json()
        print(f" -> Synthetic Records: {len(hist_synth)}")
        assert all(h["verdict"] == "synthetic" for h in hist_synth)

        hist_gen = client.get("/api/history?verdict=genuine").json()
        print(f" -> Genuine Records: {len(hist_gen)}")
        assert all(h["verdict"] == "genuine" for h in hist_gen)

        print("\n[E2E] Testing single record fetch...")
        single = client.get(f"/api/history/{data_synth['test_id']}").json()
        assert single["test_id"] == data_synth["test_id"]
        assert single["verdict"] == "synthetic"

        print("\nSUCCESS: All E2E audio forensic tests and persistence passed with flying colors! [OK]")

if __name__ == "__main__":
    run_e2e()
