from fastapi.testclient import TestClient
from app.main import app

def run_phase6_tests():
    with TestClient(app) as client:
        print("[Phase 6 Test] 1. Fetching Active PBX Switchboard Lines...")
        res = client.get("/api/telephony/lines")
        assert res.status_code == 200
        lines = res.json()
        print(f" -> Found {len(lines)} active PBX trunk lines")
        assert len(lines) == 3

        print("\n[Phase 6 Test] 2. Simulating Inbound In-Line Call with CEO Clone Attack...")
        call_res = client.post(
            "/api/telephony/simulate-call",
            data={
                "line_id": "line_treasury",
                "caller_name": "Executive Impersonator",
                "caller_number": "+1 (555) 019-4820",
                "sample_id": "ceo_clone_wire_fraud"
            }
        )
        assert call_res.status_code == 200
        call_data = call_res.json()
        print(f" -> Routing Decision: {call_data['routing_decision']}")
        print(f" -> SIP Code: {call_data['sip_response_code']}")
        print(f" -> Blacklist Status: {call_data['blacklist_status']}")
        assert call_data["routing_decision"] == "TERMINATE_AND_BLACKLIST"
        assert call_data["sip_response_code"] == 403

        print("\n[Phase 6 Test] 3. Simulating Inbound In-Line Call with Authentic Executive...")
        auth_res = client.post(
            "/api/telephony/simulate-call",
            data={
                "line_id": "line_executive",
                "caller_name": "Rajesh Verma (CEO)",
                "caller_number": "+1 (555) 018-7733",
                "sample_id": "human_executive_auth"
            }
        )
        assert auth_res.status_code == 200
        auth_data = auth_res.json()
        print(f" -> Routing Decision: {auth_data['routing_decision']}")
        print(f" -> SIP Code: {auth_data['sip_response_code']}")
        assert auth_data["routing_decision"] == "ROUTE_TO_AGENT"
        assert auth_data["sip_response_code"] == 200

        print("\n[Phase 6 Test] 4. Executing 4-Channel Codec Robustness Benchmark...")
        bench_res = client.post(
            "/api/telephony/benchmark/run",
            data={"sample_id": "ceo_clone_wire_fraud"}
        )
        assert bench_res.status_code == 200
        bench_data = bench_res.json()
        summary = bench_data["benchmark_summary"]
        print(f" -> Consistency: {summary['overall_consistency_pct']}%")
        print(f" -> Rating: {summary['robustness_rating']}")
        print(f" -> Evaluated {len(bench_data['profiles'])} telephone profiles")
        assert len(bench_data["profiles"]) == 4
        assert summary["overall_consistency_pct"] >= 75.0

        print("\n[Phase 6 Test] 5. Compiling Court-Admissible Section 65B Legal Dossier...")
        # Get latest scan record from history
        hist_res = client.get("/api/history")
        assert hist_res.status_code == 200
        scans = hist_res.json()
        assert len(scans) > 0
        target_scan_id = scans[0]["id"]

        dossier_res = client.get(f"/api/telephony/dossier/{target_scan_id}")
        assert dossier_res.status_code == 200
        dossier = dossier_res.json()
        print(f" -> Case Reference: {dossier['case_reference']}")
        print(f" -> Statutory Citation: {dossier['statutory_citation'][:45]}...")
        print(f" -> SHA-256 Checksum: {dossier['evidence_sha256']}")
        print(f" -> Chain of Custody Steps: {len(dossier['chain_of_custody'])}")
        assert "Section 66D" in dossier["statutory_citation"]
        assert len(dossier["chain_of_custody"]) == 4

        print("\nSUCCESS: All Phase 6 Telephony, Codec Benchmark, and Legal Dossier tests PASSED! [OK]")

if __name__ == "__main__":
    run_phase6_tests()
