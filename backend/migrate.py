import sqlite3
from app.db.session import engine, Base
from app.models import ScanRecord, SpeakerProfile

def migrate():
    # 1. Create tables that don't exist yet (e.g. speaker_profiles)
    Base.metadata.create_all(bind=engine)
    print("Tables created / verified.")

    # 2. Add missing columns to scan_records
    conn = sqlite3.connect("voiceguard.db")
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(scan_records)")
    cols = [row[1] for row in cursor.fetchall()]
    print("Existing columns:", cols)

    columns_to_add = [
        ("incident_status", "TEXT DEFAULT 'OPEN'"),
        ("sha256_hash", "TEXT"),
        ("speaker_match_score", "REAL"),
        ("matched_speaker_name", "TEXT")
    ]

    for name, definition in columns_to_add:
        if name not in cols:
            print(f"Adding column: {name}")
            cursor.execute(f"ALTER TABLE scan_records ADD COLUMN {name} {definition}")

    conn.commit()
    conn.close()
    print("Migration successful!")

if __name__ == "__main__":
    migrate()
