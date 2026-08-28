import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app

def run_phase3_tests():
    with TestClient(app) as client:
        print("[Phase 3 Test] Verifying Samples Catalog...")
        res = client.get("/api/samples")
        assert res.status_code == 200
        samples = res.json()
        print(f" -> Catalog contains {len(samples)} scenarios")
        assert len(samples) >= 3

        # Run CEO clone attack sample
        print("\n[Phase 3 Test] Running CEO clone attack simulation...")
        res_clone = client.post("/api/samples/ceo-clone-attack/run")
        assert res_clone.status_code == 200
        data_clone = res_clone.json()
        print(f" -> Clone verdict: {data_clone['verdict']}, risk: {data_clone['risk_score']}%")
        assert data_clone["verdict"] == "synthetic"
        assert data_clone["risk_score"] > 65.0

        # Run Executive human auth sample
        print("\n[Phase 3 Test] Running Executive human auth verification...")
        res_human = client.post("/api/samples/executive-human-auth/run")
        assert res_human.status_code == 200
        data_human = res_human.json()
        print(f" -> Human verdict: {data_human['verdict']}, risk: {data_human['risk_score']}%")
        assert data_human["verdict"] == "genuine"
        assert data_human["risk_score"] < 35.0

        # Test streaming sample audio
        print("\n[Phase 3 Test] Verifying sample audio endpoint...")
        res_audio = client.get("/api/samples/ceo-clone-attack/audio")
        assert res_audio.status_code == 200
        assert res_audio.headers["content-type"].startswith("audio/")
        print(f" -> Received {len(res_audio.content)} audio bytes")

        # Test live chunk streaming endpoint
        print("\n[Phase 3 Test] Testing /api/analyze/live-chunk...")
        sr = 16000
        chunk_data = (0.5 * np.sin(2 * np.pi * 200 * np.linspace(0, 3.5, int(sr * 3.5)))).astype(np.float32)
        buf = io.BytesIO()
        sf.write(buf, chunk_data, sr, format='WAV')
        buf.seek(0)

        files = {"chunk": ("chunk_0.wav", buf, "audio/wav")}
        data = {"chunk_index": 0, "is_final": True}
        res_chunk = client.post("/api/analyze/live-chunk", files=files, data=data)
        assert res_chunk.status_code == 200
        print(f" -> Live chunk analyzed: {res_chunk.json()['verdict']}, risk: {res_chunk.json()['risk_score']}%")

        # Test Edge-TTS live synthesis
        print("\n[Phase 3 Test] Testing live Edge-TTS custom synthesis...")
        tts_payload = {
            "text": "This is an automated test of the zero-day AI voice clone interceptor.",
            "voice": "en-US-ChristopherNeural"
        }
        res_tts = client.post("/api/samples/generate-tts", json=tts_payload)
        assert res_tts.status_code == 200
        tts_data = res_tts.json()
        print(f" -> Edge-TTS generated audio: {tts_data['audio_url']}")
        print(f" -> Forensic verdict on generated TTS: {tts_data['result']['verdict']}, risk: {tts_data['result']['risk_score']}%")

        print("\nSUCCESS: All Phase 3 backend tests passed! [OK]")

if __name__ == "__main__":
    run_phase3_tests()
