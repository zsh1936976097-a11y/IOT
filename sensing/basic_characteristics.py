import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# ======================================================
# Local default paths for coursework workflow
# ======================================================
INPUT_PATH = Path("/Users/apple/Downloads/IC/Spring/4.Iot/IOT_final project/4.data/1.IOT_Data/merged_15min.csv")
OUTPUT_DIR = Path("/Users/apple/Downloads/IC/Spring/4.Iot/IOT_final project/4.data/1.IOT_Data/basic_characteristics")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SUMMARY_CSV = OUTPUT_DIR / "basic_characteristics_summary.csv"
FIG_TIMELINE = OUTPUT_DIR / "fig_basic_timeline.png"
FIG_DAILY_PROFILE = OUTPUT_DIR / "fig_daily_profile.png"
FIG_ROLLING = OUTPUT_DIR / "fig_rolling_stats.png"


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardise column names from the merged CSV.
    Removes units / line breaks and maps them to clean names.
    """
    rename_map = {}

    for col in df.columns:
        c = str(col).strip().replace("\n", " ")

        if c == "datetime":
            rename_map[col] = "datetime"
        elif c == "date":
            rename_map[col] = "date"
        elif c == "hour":
            rename_map[col] = "hour"
        elif c == "minute":
            rename_map[col] = "minute"
        elif c.startswith("step_in_day"):
            rename_map[col] = "step_in_day"
        elif c.startswith("sensor_temp"):
            rename_map[col] = "sensor_temp"
        elif c.startswith("sensor_humi"):
            rename_map[col] = "sensor_humi"
        elif c.startswith("ext_temp"):
            rename_map[col] = "ext_temp"
        elif c.startswith("ext_humi"):
            rename_map[col] = "ext_humi"
        elif c.startswith("ext_dew"):
            rename_map[col] = "ext_dew"
        elif c.startswith("ext_rain"):
            rename_map[col] = "ext_rain"
        elif c.startswith("ext_sunshine"):
            rename_map[col] = "ext_sunshine"
        elif c.startswith("ext_wind"):
            rename_map[col] = "ext_wind"
        else:
            rename_map[col] = c.replace(" ", "_").replace("(", "").replace(")", "").replace("-", "_")

    df = df.rename(columns=rename_map)
    return df


def load_data(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = clean_column_names(df)

    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce", utc=True)

    numeric_cols = [
        "sensor_temp", "sensor_humi",
        "ext_temp", "ext_humi", "ext_dew",
        "ext_rain", "ext_sunshine", "ext_wind"
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["datetime"]).sort_values("datetime").reset_index(drop=True)
    return df


def compute_summary_metrics(df: pd.DataFrame, expected_freq="15min") -> pd.DataFrame:
    start_time = df["datetime"].min()
    end_time = df["datetime"].max()
    row_count = len(df)

    full_range = pd.date_range(start=start_time, end=end_time, freq=expected_freq, tz="UTC")
    expected_points = len(full_range)
    observed_points = df["datetime"].nunique()
    duplicate_timestamps = int(df["datetime"].duplicated().sum())
    missing_points = expected_points - observed_points
    missingness_pct = 100 * missing_points / expected_points if expected_points > 0 else np.nan

    diffs = df["datetime"].diff().dropna()
    unique_time_deltas = ", ".join(sorted(diffs.astype(str).unique().tolist()))

    metrics = {
        "monitoring_start": [str(start_time)],
        "monitoring_end": [str(end_time)],
        "monitoring_duration_days": [round((end_time - start_time).total_seconds() / 86400, 4)],
        "row_count": [row_count],
        "expected_points_15min": [expected_points],
        "observed_points_15min": [observed_points],
        "duplicate_timestamps": [duplicate_timestamps],
        "missing_points_vs_full_range": [missing_points],
        "missingness_pct": [round(missingness_pct, 4)],
        "unique_time_deltas": [unique_time_deltas],
    }

    key_cols = ["sensor_temp", "sensor_humi", "ext_temp", "ext_humi", "ext_dew", "ext_rain", "ext_wind", "ext_sunshine"]
    for col in key_cols:
        if col in df.columns:
            metrics[f"{col}_min"] = [round(df[col].min(), 4)]
            metrics[f"{col}_max"] = [round(df[col].max(), 4)]
            metrics[f"{col}_mean"] = [round(df[col].mean(), 4)]
            metrics[f"{col}_std"] = [round(df[col].std(), 4)]

    return pd.DataFrame(metrics)


def add_helper_fields(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    if "step_in_day" not in df.columns:
        df["hour"] = df["datetime"].dt.hour
        df["minute"] = df["datetime"].dt.minute
        df["step_in_day"] = df["hour"] * 4 + df["minute"] // 15

    if "sensor_temp" in df.columns and "ext_temp" in df.columns:
        df["temp_gap"] = df["sensor_temp"] - df["ext_temp"]

    if "sensor_humi" in df.columns and "ext_humi" in df.columns:
        df["humi_gap"] = df["sensor_humi"] - df["ext_humi"]

    return df


def plot_timeline(df: pd.DataFrame, out_path: Path):
    fig, ax1 = plt.subplots(figsize=(14, 5))

    ax1.plot(df["datetime"], df["sensor_temp"], label="Indoor Temp (°C)")
    ax1.set_ylabel("Temperature (°C)")
    ax1.set_xlabel("Time")

    ax2 = ax1.twinx()
    ax2.plot(df["datetime"], df["sensor_humi"], linestyle="--", label="Indoor RH (%)")
    ax2.set_ylabel("Relative Humidity (%)")

    lines, labels = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines + lines2, labels + labels2, loc="upper right")

    ax1.set_title("Indoor sensor timeline (merged 15-minute data)")
    fig.tight_layout()
    fig.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def plot_daily_profile(df: pd.DataFrame, out_path: Path):
    fig, ax1 = plt.subplots(figsize=(12, 5))

    profile = df.groupby("step_in_day").mean(numeric_only=True)

    ax1.plot(profile.index, profile["sensor_temp"], label="Avg Indoor Temp")
    ax1.set_ylabel("Temperature (°C)")
    ax1.set_xlabel("15-minute step in day (0–95)")

    ax2 = ax1.twinx()
    ax2.plot(profile.index, profile["sensor_humi"], linestyle="--", label="Avg Indoor RH")
    ax2.set_ylabel("Relative Humidity (%)")

    lines, labels = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines + lines2, labels + labels2, loc="upper right")

    ax1.set_title("Average daily profile (15-minute slots)")
    fig.tight_layout()
    fig.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def plot_rolling_stats(df: pd.DataFrame, out_path: Path, window=8):
    """
    window=8 => 8 * 15 min = 2 hours
    """
    fig, axes = plt.subplots(nrows=2, ncols=1, figsize=(14, 8), sharex=True)

    axes[0].plot(df["datetime"], df["sensor_temp"], alpha=0.4, label="Raw Indoor Temp")
    axes[0].plot(
        df["datetime"],
        df["sensor_temp"].rolling(window=window, min_periods=1).mean(),
        label=f"Rolling Mean ({window} steps)"
    )
    axes[0].set_ylabel("Temperature (°C)")
    axes[0].legend()
    axes[0].set_title("Rolling mean of indoor temperature")

    axes[1].plot(df["datetime"], df["sensor_humi"], alpha=0.4, label="Raw Indoor RH")
    axes[1].plot(
        df["datetime"],
        df["sensor_humi"].rolling(window=window, min_periods=1).mean(),
        label=f"Rolling Mean ({window} steps)"
    )
    axes[1].set_ylabel("RH (%)")
    axes[1].set_xlabel("Time")
    axes[1].legend()
    axes[1].set_title("Rolling mean of indoor relative humidity")

    fig.tight_layout()
    fig.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def main():
    print("Loading merged dataset...")
    df = load_data(INPUT_PATH)
    df = add_helper_fields(df)

    print("\nColumns after cleaning:")
    print(df.columns.tolist())

    print("\nComputing summary metrics...")
    summary_df = compute_summary_metrics(df)
    summary_df.to_csv(SUMMARY_CSV, index=False)

    print("Generating figures...")
    plot_timeline(df, FIG_TIMELINE)
    plot_daily_profile(df, FIG_DAILY_PROFILE)
    plot_rolling_stats(df, FIG_ROLLING)

    print("\nDone.")
    print(f"Summary saved to : {SUMMARY_CSV}")
    print(f"Timeline figure  : {FIG_TIMELINE}")
    print(f"Daily profile    : {FIG_DAILY_PROFILE}")
    print(f"Rolling stats    : {FIG_ROLLING}")
    print("\nPreview of summary:")
    print(summary_df.T)


if __name__ == "__main__":
    main()