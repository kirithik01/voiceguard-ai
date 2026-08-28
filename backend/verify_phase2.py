import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app

def run_test():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        print("Health Check Response:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Synthesize audio buffer (16kHz, 3 seconds)
        sr = 16000
        t = np.linspace(0, 3, sr * 3, endpoint=False)
        # Create audio with harmonics & dynamic pitch vibrato
        f0 = 220 + 30 * np.sin(2 * np.pi * 3 * t)
        phase = 2 * np.pi * np.cumsum(f0) / sr
        audio = 0.5 * np.sin(phase) + 0.25 * np.sin(2 * phase)
        
        buf = io.BytesIO()
        sf.write(buf, audio.astype(np.float32), sr, format='WAV')
        buf.seek(0)

        # 3. Analyze file
        files = {"file": ("test_sample.wav", buf, "audio/wav")}
        res = client.post("/api/analyze/file", files=files)
        print("Analyze File Status:", res.status_code)
        data = res.json()
        print("Analyze Result Summary:", {
            "test_id": data.get("test_id"),
            "verdict": data.get("verdict"),
            "risk_score": data.get("risk_score"),
            "confidence": data.get("confidence"),
            "chunks_count": len(data.get("chunk_scores", [])),
            "acoustic_features": data.get("acoustic_features")
        })
        assert res.status_code == 200
        test_id = data["test_id"]

        # 4. Check history
        res = client.get("/api/history")
        print("History Count:", len(res.json()))
        assert len(res.json()) > 0

        # 5. Check history by ID
        res = client.get(f"/api/history/{test_id}")
        assert res.status_code == 200
        assert res.json()["test_id"] == test_id

        print("\nAll Backend Phase 2 API tests PASSED successfully! [OK]")

if __name__ == "__main__":
    run_test()
