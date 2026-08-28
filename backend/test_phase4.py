import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app

def generate_tone(freq=170.0, duration=3.0, sr=16000):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    wave = 0.5 * np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * 2 * freq * t)
    buf = io.BytesIO()
    sf.write(buf, wave.astype(np.float32), sr, format='WAV')
    buf.seek(0)
    return buf

def run_phase4_tests():
    with TestClient(app) as client:
        print("[Phase 4 Test] 1. Listing Enrolled Speakers...")
        speakers_res = client.get("/api/speakers")
        assert speakers_res.status_code == 200
        speakers = speakers_res.json()
        print(f" -> Found {len(speakers)} enrolled speakers")
        assert len(speakers) > 0
        target_speaker = speakers[0]
        print(f" -> Target: {target_speaker['name']} ({target_speaker['role']})")

        print("\n[Phase 4 Test] 2. Testing Speaker Enrollment API...")
        enroll_buf = generate_tone(freq=210.0)
        enroll_data = {
            "name": "Sunita Rao",
            "role": "Chief Technology Officer",
            "department": "IT Security"
        }
        enroll_files = {"file": ("sunita_baseline.wav", enroll_buf, "audio/wav")}
        enroll_res = client.post("/api/speakers/enroll", data=enroll_data, files=enroll_files)
        assert enroll_res.status_code == 200
        enrolled_profile = enroll_res.json()
        print(f" -> Successfully enrolled: {enrolled_profile['name']} (ID: {enrolled_profile['id']})")

        print("\n[Phase 4 Test] 3. Testing Dual-Engine Verification with Matching Voice...")
        with open("samples/human_executive_auth.wav", "rb") as f:
            matching_bytes = f.read()
        verify_files = {"file": ("matching_auth.wav", io.BytesIO(matching_bytes), "audio/wav")}
        verify_data = {"speaker_id": target_speaker["id"]}
        verify_res = client.post("/api/speakers/verify", data=verify_data, files=verify_files)
        assert verify_res.status_code == 200
        match_out = verify_res.json()
        print(f" -> Dual Verdict: {match_out['dual_engine_final_verdict']}")
        print(f" -> Biometric Match: {match_out['biometric_similarity_pct']}%, Liveness Risk: {match_out['liveness_risk_score']}%")
        assert match_out["dual_engine_final_verdict"] == "AUTHORIZED_AUTHENTIC"

        print("\n[Phase 4 Test] 4. Testing Dual-Engine Verification with Deepfake Clone...")
        with open("samples/ceo_clone_wire_fraud.wav", "rb") as f:
            clone_bytes = f.read()
        clone_files = {"file": ("ceo_clone.wav", io.BytesIO(clone_bytes), "audio/wav")}
        clone_res = client.post("/api/speakers/verify", data={"speaker_id": target_speaker["id"]}, files=clone_files)
        assert clone_res.status_code == 200
        clone_out = clone_res.json()
        print(f" -> Dual Verdict: {clone_out['dual_engine_final_verdict']}")
        print(f" -> Biometric Match: {clone_out['biometric_similarity_pct']}%, Liveness Risk: {clone_out['liveness_risk_score']}%")
        assert clone_out["dual_engine_final_verdict"] == "SPOOFED_CLONE"

        print("\n[Phase 4 Test] 5. Testing SOC Analytics Endpoint...")
        soc_res = client.get("/api/soc/analytics")
        assert soc_res.status_code == 200
        soc_data = soc_res.json()
        print(f" -> Total Scans in SOC: {soc_data['total_scans']}, Open Incidents: {soc_data['open_incidents']}")
        print(f" -> Attack Vectors count: {len(soc_data['attack_vectors'])}, Vocoders: {len(soc_data['vocoder_breakdown'])}")
        assert len(soc_data["recent_incidents"]) > 0
        incident_id = soc_data["recent_incidents"][0]["id"]

        print(f"\n[Phase 4 Test] 6. Updating Incident {incident_id} Status...")
        patch_res = client.patch(
            f"/api/soc/incidents/{incident_id}/status",
            json={"status": "CONTAINED", "analyst_note": "Verified Out-of-Band Callback"}
        )
        assert patch_res.status_code == 200
        print(f" -> Incident status updated: {patch_res.json()['new_status']}")

        print(f"\n[Phase 4 Test] 7. Dispatching SIEM Alert for Incident {incident_id}...")
        siem_res = client.post(f"/api/soc/incidents/{incident_id}/dispatch-alert")
        assert siem_res.status_code == 200
        siem_out = siem_res.json()
        print(f" -> SIEM Alert: {siem_out['status']} to {siem_out['destination']}")
        print(f" -> Incident Ref: {siem_out['alert_payload']['cert_in_reporting_code']}")

        print("\n[Phase 4 Test] 8. Cleaning up test enrolled speaker...")
        del_res = client.delete(f"/api/speakers/{enrolled_profile['id']}")
        assert del_res.status_code == 200

        print("\nSUCCESS: All Phase 4 Dual-Engine Biometric & SOC tests PASSED! [OK]")

if __name__ == "__main__":
    run_phase4_tests()
