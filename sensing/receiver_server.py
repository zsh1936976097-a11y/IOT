from flask import Flask, request, jsonify
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
import threading

app = Flask(__name__)

# ======================================================
# Coursework workflow paths
# ======================================================
BASE_DIR = Path(r"C:\Repos\test")
BASE_DIR.mkdir(parents=True, exist_ok=True)

OUT_FILE = BASE_DIR / "received_sensor_data.csv"
LOCK = threading.Lock()

REQUIRED_FIELDS = {"record_id", "timestamp", "temp_c", "humidity_pct"}


def ensure_csv_exists():
    if not OUT_FILE.exists():
        df = pd.DataFrame(columns=[
            "record_id",
            "timestamp",
            "temp_c",
            "humidity_pct",
            "received_at_utc"
        ])
        df.to_csv(OUT_FILE, index=False)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/ingest", methods=["POST"])
def ingest():
    if not request.is_json:
        return jsonify({"status": "error", "message": "Request must be JSON"}), 400

    payload = request.get_json()
    missing = REQUIRED_FIELDS - set(payload.keys())
    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing fields: {sorted(list(missing))}"
        }), 400

    try:
        row = {
            "record_id": int(payload["record_id"]),
            "timestamp": str(payload["timestamp"]),
            "temp_c": float(payload["temp_c"]),
            "humidity_pct": float(payload["humidity_pct"]),
            "received_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    except Exception as e:
        return jsonify({"status": "error", "message": f"Bad payload types: {e}"}), 400

    ensure_csv_exists()

    with LOCK:
        df_new = pd.DataFrame([row])

        if OUT_FILE.exists() and OUT_FILE.stat().st_size > 0:
            df_old = pd.read_csv(OUT_FILE)
            df_all = pd.concat([df_old, df_new], ignore_index=True)
            df_all = df_all.drop_duplicates(subset=["record_id", "timestamp"], keep="last")
        else:
            df_all = df_new

        df_all.to_csv(OUT_FILE, index=False)

    return jsonify({
        "status": "ok",
        "saved_record_id": row["record_id"],
        "output_file": str(OUT_FILE)
    }), 200


if __name__ == "__main__":
    ensure_csv_exists()
    print("=" * 60)
    print("RECEIVER SERVER STARTED")
    print("=" * 60)
    print(f"Output file: {OUT_FILE}")
    print("Listening on: http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
