import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app

def generate_tone(freq=200.0, duration=2.5, sr=16000):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    wave = 0.4 * np.sin(2 * np.pi * freq * t)
    buf = io.BytesIO()
    sf.write(buf, wave.astype(np.float32), sr, format='WAV')
    buf.seek(0)
    return buf

def run_phase5_tests():
    with TestClient(app) as client:
        print("[Phase 5 Test] 1. Fetching Initial Settings...")
        res = client.get("/api/settings")
        assert res.status_code == 200
        settings_data = res.json()
        print(f" -> Initial tier: {settings_data['security_tier']}, Low: {settings_data['low_risk_threshold']}%, High: {settings_data['high_risk_threshold']}%")

        print("\n[Phase 5 Test] 2. Updating Security Posture to 'strict' (Banking Mode)...")
        patch_res = client.post("/api/settings", json={"security_tier": "strict"})
        assert patch_res.status_code == 200
        strict_data = patch_res.json()
        print(f" -> Updated tier: {strict_data['security_tier']}, Low: {strict_data['low_risk_threshold']}%, High: {strict_data['high_risk_threshold']}%")
        assert strict_data["low_risk_threshold"] == 20.0
        assert strict_data["high_risk_threshold"] == 45.0

        print("\n[Phase 5 Test] 3. Embedding Inaudible Acoustic Watermark into Audio...")
        clean_buf = generate_tone(freq=220.0)
        embed_files = {"file": ("corporate_broadcast.wav", clean_buf, "audio/wav")}
        embed_res = client.post(
            "/api/watermark/embed",
            data={"custom_tag": "VOICEGUARD_ENTERPRISE_AUTHENTIC_2026"},
            files=embed_files
        )
        assert embed_res.status_code == 200
        watermarked_bytes = embed_res.content
        assert len(watermarked_bytes) > 1000
        print(f" -> Successfully synthesized watermarked master audio ({len(watermarked_bytes)} bytes)")

        print("\n[Phase 5 Test] 4. Verifying Watermarked Audio...")
        verify_files = {"file": ("watermarked_test.wav", io.BytesIO(watermarked_bytes), "audio/wav")}
        verify_res = client.post("/api/watermark/verify", files=verify_files)
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        print(f" -> Watermark Detected: {verify_data['is_watermarked']}")
        print(f" -> Signature Status: {verify_data['signature_status']}")
        print(f" -> Confidence: {verify_data['confidence']}")
        assert verify_data["is_watermarked"] is True
        assert verify_data["signature_status"] == "AUTHENTIC_CORPORATE_SIGNATURE"

        print("\n[Phase 5 Test] 5. Verifying Unwatermarked Audio...")
        unwatermarked_buf = generate_tone(freq=300.0)
        unwm_files = {"file": ("unwatermarked.wav", unwatermarked_buf, "audio/wav")}
        unwm_res = client.post("/api/watermark/verify", files=unwm_files)
        assert unwm_res.status_code == 200
        unwm_data = unwm_res.json()
        print(f" -> Watermark Detected: {unwm_data['is_watermarked']}")
        print(f" -> Signature Status: {unwm_data['signature_status']}")
        assert unwm_data["is_watermarked"] is False

        print("\n[Phase 5 Test] 6. Restoring Standard Policy Tier...")
        restore_res = client.post("/api/settings", json={"security_tier": "standard"})
        assert restore_res.status_code == 200

        print("\nSUCCESS: All Phase 5 Policy Tuning & Watermarking tests PASSED! [OK]")

if __name__ == "__main__":
    run_phase5_tests()
