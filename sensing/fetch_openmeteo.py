import argparse
from pathlib import Path
import pandas as pd
import requests

# ======================================================
# Coursework workflow paths
# ======================================================
BASE_DIR = Path(r"C:\Repos\test")
BASE_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_EXCEL_INPUT = BASE_DIR / "open-meteo-51.51N0.22W8m.xlsx"
DEFAULT_OUTPUT_CSV = BASE_DIR / "openmeteo_standardised.csv"

# White City, London
DEFAULT_LAT = 51.507
DEFAULT_LON = -0.221
DEFAULT_START_DATE = "2026-02-15"
DEFAULT_END_DATE = "2026-02-28"
DEFAULT_TIMEZONE = "UTC"


def load_from_excel(input_path: Path, output_path: Path | None = None) -> pd.DataFrame:
    """
    Load already-downloaded Open-Meteo Excel data and standardise column names.

    This is the primary mode used in the coursework workflow, because the
    project dataset was exported manually from Open-Meteo and stored locally.
    """
    if not input_path.exists():
        raise FileNotFoundError(f"Excel input not found: {input_path}")

    df = pd.read_excel(input_path)

    possible_dt_cols = [c for c in df.columns if "time" in c.lower() or "date" in c.lower()]
    if not possible_dt_cols:
        raise ValueError("Could not find a datetime column in the Excel file.")

    dt_col = possible_dt_cols[0]
    df = df.rename(columns={dt_col: "datetime"})
    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce", utc=True)

    rename_map = {}
    for col in df.columns:
        c = col.lower().strip()

        if ("temperature" in c and "2 m" in c) or c == "temperature_2m":
            rename_map[col] = "ext_temp"
        elif ("relative humidity" in c and "2 m" in c) or c == "relative_humidity_2m":
            rename_map[col] = "ext_humi"
        elif "dew point" in c or "dewpoint" in c or c == "dew_point_2m":
            rename_map[col] = "ext_dew"
        elif c == "rain" or c == "rain (mm)":
            rename_map[col] = "ext_rain"
        elif "precipitation" in c:
            rename_map[col] = "ext_precip"
        elif ("wind speed" in c and "10 m" in c) or c == "wind_speed_10m":
            rename_map[col] = "ext_wind"
        elif "sunshine duration" in c or c == "sunshine_duration":
            rename_map[col] = "ext_sunshine"
        elif "is day" in c or "day or night" in c or c == "is_day":
            rename_map[col] = "is_day"

    df = df.rename(columns=rename_map)
    df = df.sort_values("datetime").reset_index(drop=True)

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)

    return df


def fetch_from_api(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    timezone: str = "UTC",
    output_path: Path | None = None
) -> pd.DataFrame:
    """
    Fetch 15-minute weather data from Open-Meteo API.

    This mode is included to show reproducibility and automation capability,
    but the main coursework dataset was prepared from an exported Excel file.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "minutely_15": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "dew_point_2m",
            "rain",
            "precipitation",
            "wind_speed_10m",
            "sunshine_duration",
            "is_day",
        ]),
        "start_date": start_date,
        "end_date": end_date,
        "timezone": timezone,
    }

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    payload = response.json()

    if "minutely_15" not in payload:
        raise ValueError("Open-Meteo response does not contain 'minutely_15' data.")

    m15 = payload["minutely_15"]

    df = pd.DataFrame({
        "datetime": pd.to_datetime(m15["time"], utc=True),
        "ext_temp": m15.get("temperature_2m"),
        "ext_humi": m15.get("relative_humidity_2m"),
        "ext_dew": m15.get("dew_point_2m"),
        "ext_rain": m15.get("rain"),
        "ext_precip": m15.get("precipitation"),
        "ext_wind": m15.get("wind_speed_10m"),
        "ext_sunshine": m15.get("sunshine_duration"),
        "is_day": m15.get("is_day"),
    })

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)

    return df


def print_summary(df: pd.DataFrame, label: str):
    print("\n" + "=" * 60)
    print(f"{label} SUMMARY")
    print("=" * 60)
    print(f"Rows: {len(df)}")
    if "datetime" in df.columns and df["datetime"].notna().any():
        print(f"Start time: {df['datetime'].min()}")
        print(f"End time  : {df['datetime'].max()}")
    print("\nColumns:")
    for c in df.columns:
        print(f"  - {c}")
    print("\nPreview:")
    print(df.head())


def main():
    parser = argparse.ArgumentParser(
        description="Load or fetch Open-Meteo 15-minute weather data."
    )
    subparsers = parser.add_subparsers(dest="mode")

    excel_parser = subparsers.add_parser("excel", help="Load already-downloaded Open-Meteo Excel file")
    excel_parser.add_argument(
        "--input",
        default=str(DEFAULT_EXCEL_INPUT),
        help="Path to downloaded Open-Meteo Excel"
    )
    excel_parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_CSV),
        help="Path to save standardised CSV"
    )

    api_parser = subparsers.add_parser("api", help="Fetch Open-Meteo data via API")
    api_parser.add_argument("--lat", type=float, default=DEFAULT_LAT)
    api_parser.add_argument("--lon", type=float, default=DEFAULT_LON)
    api_parser.add_argument("--start-date", default=DEFAULT_START_DATE)
    api_parser.add_argument("--end-date", default=DEFAULT_END_DATE)
    api_parser.add_argument("--timezone", default=DEFAULT_TIMEZONE)
    api_parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_CSV),
        help="Path to save fetched CSV"
    )

    args = parser.parse_args()

    # Default coursework behaviour: use the already-downloaded Excel file
    if args.mode is None or args.mode == "excel":
        input_path = Path(getattr(args, "input", DEFAULT_EXCEL_INPUT))
        output_path = Path(getattr(args, "output", DEFAULT_OUTPUT_CSV))

        print("MODE        = excel")
        print(f"INPUT_PATH  = {input_path}")
        print(f"OUTPUT_PATH = {output_path}")

        df = load_from_excel(
            input_path=input_path,
            output_path=output_path
        )
        print_summary(df, "EXCEL WEATHER DATA")

    elif args.mode == "api":
        output_path = Path(args.output)

        print("MODE        = api")
        print(f"LAT/LON     = {args.lat}, {args.lon}")
        print(f"DATE RANGE  = {args.start_date} to {args.end_date}")
        print(f"TIMEZONE    = {args.timezone}")
        print(f"OUTPUT_PATH = {output_path}")

        df = fetch_from_api(
            latitude=args.lat,
            longitude=args.lon,
            start_date=args.start_date,
            end_date=args.end_date,
            timezone=args.timezone,
            output_path=output_path
        )
        print_summary(df, "API WEATHER DATA")


if __name__ == "__main__":
    main()
