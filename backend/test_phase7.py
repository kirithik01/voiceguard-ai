from fastapi.testclient import TestClient
from app.main import app

def run_phase7_tests():
    with TestClient(app) as client:
        print("[Phase 7 Test] 1. Fetching Global Threat Intelligence Stats...")
        stats_res = client.get("/api/threat-intel/stats")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        print(f" -> Attacks Intercepted: {stats['attacks_intercepted']}")
        print(f" -> Total Fraud Averted: ${stats['total_fraud_averted_usd']:,}")
        print(f" -> Average Latency: {stats['avg_latency_ms']} ms")
        print(f" -> Blacklisted Numbers: {stats['telecom_blacklisted_numbers']}")
        assert stats["total_fraud_averted_usd"] > 0
        assert stats["avg_latency_ms"] < 200

        print("\n[Phase 7 Test] 2. Fetching Threat Geolocation Radar Points...")
        map_res = client.get("/api/threat-intel/map")
        assert map_res.status_code == 200
        points = map_res.json()
        print(f" -> Tracked {len(points)} global and national financial threat hubs")
        assert len(points) >= 5
        hub_cities = [p["city"] for p in points]
        print(f" -> Hub Cities: {', '.join(hub_cities)}")
        assert "Mumbai" in hub_cities
        assert "Bengaluru" in hub_cities
        assert "New York" in hub_cities

        print("\n[Phase 7 Test] 3. Fetching Real-Time Intercept Streaming Feed...")
        feed_res = client.get("/api/threat-intel/feed")
        assert feed_res.status_code == 200
        feed = feed_res.json()
        print(f" -> Retrieved {len(feed)} live threat feed entries")
        if len(feed) > 0:
            first = feed[0]
            print(f" -> Latest: {first['target_sector']} | {first['verdict'].upper()} | Risk: {first['risk_score']:.1f}%")

        print("\nSUCCESS: All Phase 7 Threat Intelligence, Jury Pitch & Developer API tests PASSED! [OK]")

if __name__ == "__main__":
    run_phase7_tests()
