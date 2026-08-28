import os
from fastapi.testclient import TestClient
from app.main import app

def run_phase8_tests():
    with TestClient(app) as client:
        print("[Phase 8 Test] 1. Fetching Vernacular Regional Language Attack Vectors...")
        samples_res = client.get("/api/multilingual/samples")
        assert samples_res.status_code == 200
        samples = samples_res.json()
        print(f" -> Loaded {len(samples)} Indian vernacular attack scenarios")
        assert len(samples) >= 4
        langs = [s["language"] for s in samples]
        safe_langs = [l.encode('ascii', 'ignore').decode().strip() for l in langs]
        print(f" -> Languages: {', '.join(safe_langs)}")
        assert any("Hindi" in l for l in langs)
        assert any("Tamil" in l for l in langs)
        assert any("Telugu" in l for l in langs)

        print("\n[Phase 8 Test] 2. Synthesizing & Analyzing Real-Time Hindi Regional Clone...")
        hindi_res = client.post(
            "/api/multilingual/generate-vernacular",
            json={
                "text": "नमस्ते, मैं साइबर क्राइम पुलिस स्टेशन से इंस्पेक्टर विजय बोल रहा हूँ।",
                "language": "Hindi",
                "voice": "hi-IN-MadhurNeural"
            }
        )
        assert hindi_res.status_code == 200
        hindi_data = hindi_res.json()
        result = hindi_data["result"]
        print(f" -> Language: {hindi_data['language']}")
        print(f" -> Verdict: {result['verdict'].upper()}")
        print(f" -> Risk Score: {result['risk_score']:.1f}%")
        print(f" -> Audio Stream URL: {hindi_data['audio_url']}")
        assert result["verdict"] == "synthetic"
        assert result["risk_score"] > 60

        print("\n[Phase 8 Test] 3. Testing Adversarial Noise & Speed Shift Evasion Resistance...")
        adv_res = client.post(
            "/api/adversarial/stress-test",
            data={
                "noise_level": "0.20",
                "tempo_factor": "1.10",
                "sample_id": "ceo_clone_wire_fraud"
            }
        )
        assert adv_res.status_code == 200
        adv_data = adv_res.json()
        print(f" -> Bypass Prevented: {adv_data['adversarial_bypass_prevented']}")
        print(f" -> Is Resilient: {adv_data['is_resilient']}")
        print(f" -> Evaluated {len(adv_data['stages'])} defense stages")
        assert len(adv_data["stages"]) == 3
        assert adv_data["adversarial_bypass_prevented"] is True

        print("\n[Phase 8 Test] 4. Checking Docker & Containerization Artifacts...")
        assert os.path.exists("../docker-compose.yml"), "docker-compose.yml missing"
        assert os.path.exists("Dockerfile"), "backend Dockerfile missing"
        assert os.path.exists("../frontend/Dockerfile"), "frontend Dockerfile missing"
        print(" -> docker-compose.yml, backend/Dockerfile, frontend/Dockerfile verified [OK]")

        print("\nSUCCESS: All Phase 8 Vernacular, Adversarial, and Containerization tests PASSED! [OK]")

if __name__ == "__main__":
    run_phase8_tests()
