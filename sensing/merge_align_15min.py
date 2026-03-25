import argparse
from pathlib import Path
import pandas as pd

# ======================================================
# Coursework workflow paths
# ======================================================
BASE_DIR = Path(r"C:\Repos\test")
BASE_DIR.mkdir(parents=True, exist_ok=True)

# Update this filename if your raw indoor sensor file uses a different name
DEFAULT_SENSOR_PATH = BASE_DIR / "IOT_0311.xlsx"
DEFAULT_WEATHER_PATH = BASE_DIR / "openmeteo_standardised.csv"
DEFAULT_OUTPUT_PATH = BASE_DIR / "merged_data.csv"
DEFAULT_SENSOR_15_OUTPUT_PATH = BASE_DIR / "sensor_15min_avg.csv"


def standardise_sensor_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardise sensor data column names.

    Expected output columns:
      - datetime
      - sensor_temp
      - sensor_humi
    """
    original_cols = list(df.columns)
    rename_map = {}

    for col in df.columns:
        c = str(col).lower().strip()

        if c in {"datetime", "timestamp", "time", "date"} or "time" in c or "date" in c:
            rename_map[col] = "datetime"
        elif "temp" in c:
            rename_map[col] = "sensor_temp"
        elif "humi" in c or "humid" in c:
            rename_map[col] = "sensor_humi"

    df = df.rename(columns=rename_map)

    required = {"datetime", "sensor_temp", "sensor_humi"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Could not standardise sensor columns. Missing required columns: {missing}. "
            f"Original columns were: {original_cols}"
        )

    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce", utc=True)
    df["sensor_temp"] = pd.to_numeric(df["sensor_temp"], errors="coerce")
    df["sensor_humi"] = pd.to_numeric(df["sensor_humi"], errors="coerce")

    df = df.dropna(subset=["datetime"]).sort_values("datetime").reset_index(drop=True)
    return df


def standardise_weather_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardise weather data column names where possible.

    Expected minimum:
      - datetime
    Common standardised columns:
      - ext_temp
      - ext_humi
      - ext_dew
      - ext_rain
      - ext_precip
      - ext_wind
      - ext_sunshine
      - is_day
    """
    original_cols = list(df.columns)
    rename_map = {}

    for col in df.columns:
        c = str(col).lower().strip()

        if c in {"datetime", "timestamp", "time", "date"} or "time" in c or "date" in c:
            rename_map[col] = "datetime"
        elif ("temperature" in c and "2 m" in c) or c == "temperature_2m":
            rename_map[col] = "ext_temp"
        elif ("relative humidity" in c and "2 m" in c) or c == "relative_humidity_2m":
            rename_map[col] = "ext_humi"
        elif "dew point" in c or "dewpoint" in c or c == "dew_point_2m":
            rename_map[col] = "ext_dew"
        elif c in {"rain", "rain (mm)"}:
            rename_map[col] = "ext_rain"
        elif "precipitation" in c or c == "precipitation":
            rename_map[col] = "ext_precip"
        elif ("wind speed" in c and "10 m" in c) or c == "wind_speed_10m":
            rename_map[col] = "ext_wind"
        elif "sunshine duration" in c or c == "sunshine_duration":
            rename_map[col] = "ext_sunshine"
        elif "is day" in c or "day or night" in c or c == "is_day":
            rename_map[col] = "is_day"

    df = df.rename(columns=rename_map)

    if "datetime" not in df.columns:
        raise ValueError(
            f"Could not standardise weather datetime column. Original columns were: {original_cols}"
        )

    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce", utc=True)
    df = df.dropna(subset=["datetime"]).sort_values("datetime").reset_index(drop=True)
    return df


def load_sensor_data(sensor_path: Path) -> pd.DataFrame:
    if not sensor_path.exists():
        raise FileNotFoundError(f"Sensor input not found: {sensor_path}")

    if sensor_path.suffix.lower() in [".xlsx", ".xls"]:
        df = pd.read_excel(sensor_path)
    else:
        df = pd.read_csv(sensor_path)

    return standardise_sensor_columns(df)


def load_weather_data(weather_path: Path) -> pd.DataFrame:
    if not weather_path.exists():
        raise FileNotFoundError(f"Weather input not found: {weather_path}")

    if weather_path.suffix.lower() in [".xlsx", ".xls"]:
        df = pd.read_excel(weather_path)
    else:
        df = pd.read_csv(weather_path)

    return standardise_weather_columns(df)


def check_sensor_interval(sensor_df: pd.DataFrame) -> None:
    """Print a simple check of raw sensor timestamp spacing."""
    if len(sensor_df) < 2:
        print("WARNING: Sensor dataset too short to check raw intervals.")
        return

    diffs = sensor_df["datetime"].diff().dropna()
    counts = diffs.value_counts().sort_index()

    print("\nRaw sensor interval check:")
    for delta, count in counts.items():
        print(f"  {delta}: {count}")

    expected_delta = pd.Timedelta(minutes=5)
    if len(counts) == 1 and counts.index[0] == expected_delta:
        print("Raw sensor timestamps are perfectly regular at 5-minute intervals.")
    else:
        print("WARNING: Raw sensor timestamps are not perfectly regular at 5-minute intervals.")
        print("The aggregation step will still run, but raw timing should be reviewed if unexpected.")


def aggregate_sensor_to_15min(sensor_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate 5-minute sensor data into 15-minute means aligned to the left edge.

    Left-edge alignment rule:
      00:00, 00:05, 00:10 -> 00:00
      00:15, 00:20, 00:25 -> 00:15
    """
    sensor_df = sensor_df.copy()
    sensor_df["datetime_15"] = sensor_df["datetime"].dt.floor("15min")

    grouped = (
        sensor_df.groupby("datetime_15", as_index=False)
        .agg({"sensor_temp": "mean", "sensor_humi": "mean"})
        .rename(columns={"datetime_15": "datetime"})
    )
    return grouped


def merge_sensor_weather(
    sensor_15: pd.DataFrame,
    weather_df: pd.DataFrame,
    how: str = "outer"
) -> pd.DataFrame:
    merged = pd.merge(sensor_15, weather_df, on="datetime", how=how, indicator=True)
    merged = merged.sort_values("datetime").reset_index(drop=True)

    print("\nMerge source breakdown:")
    for k, v in merged["_merge"].value_counts(dropna=False).to_dict().items():
        print(f"  {k}: {v}")

    merged["date"] = merged["datetime"].dt.date
    merged["hour"] = merged["datetime"].dt.hour
    merged["minute"] = merged["datetime"].dt.minute
    merged["step_in_day"] = merged["hour"] * 4 + merged["minute"] // 15

    return merged


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate 5-minute sensor data to 15-minute intervals and merge with weather data."
    )
    parser.add_argument(
        "--sensor",
        default=str(DEFAULT_SENSOR_PATH),
        help="Path to raw sensor Excel/CSV"
    )
    parser.add_argument(
        "--weather",
        default=str(DEFAULT_WEATHER_PATH),
        help="Path to weather Excel/CSV"
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_PATH),
        help="Output merged CSV path"
    )
    parser.add_argument(
        "--sensor-15-output",
        default=str(DEFAULT_SENSOR_15_OUTPUT_PATH),
        help="Optional path to save aggregated 15-minute sensor data"
    )
    parser.add_argument(
        "--merge-how",
        default="outer",
        choices=["inner", "outer", "left", "right"],
        help="Merge mode for aligning sensor and weather data"
    )
    parser.add_argument(
        "--drop-merge-indicator",
        action="store_true",
        help="Drop the _merge indicator column before saving"
    )
    args = parser.parse_args()

    sensor_path = Path(args.sensor)
    weather_path = Path(args.weather)
    output_path = Path(args.output)
    sensor_15_output_path = Path(args.sensor_15_output) if args.sensor_15_output else None

    print("COURSEWORK MERGE WORKFLOW")
    print("=" * 60)
    print(f"SENSOR INPUT        = {sensor_path}")
    print(f"WEATHER INPUT       = {weather_path}")
    print(f"MERGED OUTPUT       = {output_path}")
    print(f"SENSOR 15MIN OUTPUT = {sensor_15_output_path}")
    print(f"MERGE MODE          = {args.merge_how}")

    sensor_df = load_sensor_data(sensor_path)
    weather_df = load_weather_data(weather_path)

    check_sensor_interval(sensor_df)

    sensor_15 = aggregate_sensor_to_15min(sensor_df)
    merged = merge_sensor_weather(sensor_15, weather_df, how=args.merge_how)

    sensor_only = int((merged["_merge"] == "left_only").sum())
    weather_only = int((merged["_merge"] == "right_only").sum())
    both = int((merged["_merge"] == "both").sum())

    print("\nGap report:")
    print(f"  Sensor-only timestamps : {sensor_only}")
    print(f"  Weather-only timestamps: {weather_only}")
    print(f"  Matched timestamps     : {both}")

    if args.drop_merge_indicator:
        merged = merged.drop(columns=["_merge"])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    merged.to_csv(output_path, index=False)

    if sensor_15_output_path:
        sensor_15_output_path.parent.mkdir(parents=True, exist_ok=True)
        sensor_15.to_csv(sensor_15_output_path, index=False)

    print("\nMerge summary:")
    print(f"  Raw sensor rows        : {len(sensor_df)}")
    print(f"  Aggregated 15-min rows : {len(sensor_15)}")
    print(f"  Weather rows           : {len(weather_df)}")
    print(f"  Merged rows            : {len(merged)}")
    print(f"Saved merged dataset to  : {output_path}")
    if sensor_15_output_path:
        print(f"Saved 15-min sensor data : {sensor_15_output_path}")


if __name__ == "__main__":
    main()
