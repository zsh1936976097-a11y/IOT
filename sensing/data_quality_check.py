import argparse
from pathlib import Path
import pandas as pd

# ======================================================
# Local default paths for coursework workflow
# ======================================================
DEFAULT_INPUT_PATH = "/Users/apple/Downloads/IC/Spring/4.Iot/IOT_final project/4.data/1.IOT_Data/merged_15min.csv"
DEFAULT_OUTPUT_PATH = "/Users/apple/Downloads/IC/Spring/4.Iot/IOT_final project/4.data/1.IOT_Data/data_quality_report.csv"
DEFAULT_FREQ = "15min"


def load_data(path: Path) -> pd.DataFrame:
    if path.suffix.lower() in [".xlsx", ".xls"]:
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)

    if "datetime" not in df.columns:
        possible_dt_cols = [c for c in df.columns if "time" in c.lower() or "date" in c.lower()]
        if not possible_dt_cols:
            raise ValueError("Could not find datetime column.")
        df = df.rename(columns={possible_dt_cols[0]: "datetime"})

    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce", utc=True)
    df = df.sort_values("datetime").reset_index(drop=True)
    return df


def run_quality_checks(df: pd.DataFrame, expected_freq: str = "15min") -> dict:
    metrics = {}

    metrics["row_count"] = len(df)
    metrics["start_time"] = str(df["datetime"].min())
    metrics["end_time"] = str(df["datetime"].max())
    metrics["duplicate_timestamps"] = int(df["datetime"].duplicated().sum())
    metrics["missing_datetime"] = int(df["datetime"].isna().sum())

    if len(df) > 1:
        diffs = df["datetime"].diff().dropna()
        metrics["unique_time_deltas"] = sorted(diffs.astype(str).unique().tolist())
    else:
        metrics["unique_time_deltas"] = []

    if df["datetime"].notna().sum() >= 2:
        full_range = pd.date_range(
            start=df["datetime"].min(),
            end=df["datetime"].max(),
            freq=expected_freq,
            tz="UTC"
        )
        metrics["expected_points"] = len(full_range)
        metrics["observed_points"] = int(df["datetime"].nunique())
        metrics["missing_points_vs_full_range"] = int(len(full_range) - df["datetime"].nunique())

        if len(full_range) > 0:
            metrics["missingness_pct"] = round(
                100 * metrics["missing_points_vs_full_range"] / len(full_range), 4
            )
        else:
            metrics["missingness_pct"] = None
    else:
        metrics["expected_points"] = None
        metrics["observed_points"] = None
        metrics["missing_points_vs_full_range"] = None
        metrics["missingness_pct"] = None

    # Missingness per column
    col_missing = {}
    for col in df.columns:
        col_missing[col] = int(df[col].isna().sum())
    metrics["missing_by_column"] = col_missing

    # Numeric summary
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    numeric_summary = {}
    for col in numeric_cols:
        numeric_summary[col] = {
            "min": float(df[col].min()) if df[col].notna().any() else None,
            "max": float(df[col].max()) if df[col].notna().any() else None,
            "mean": float(df[col].mean()) if df[col].notna().any() else None,
        }
    metrics["numeric_summary"] = numeric_summary

    return metrics


def print_report(metrics: dict):
    print("=" * 60)
    print("DATA QUALITY REPORT")
    print("=" * 60)
    print(f"Rows: {metrics['row_count']}")
    print(f"Start time: {metrics['start_time']}")
    print(f"End time: {metrics['end_time']}")
    print(f"Duplicate timestamps: {metrics['duplicate_timestamps']}")
    print(f"Missing datetime values: {metrics['missing_datetime']}")
    print(f"Expected points: {metrics['expected_points']}")
    print(f"Observed unique timestamps: {metrics['observed_points']}")
    print(f"Missing points vs full range: {metrics['missing_points_vs_full_range']}")
    print(f"Missingness (%): {metrics['missingness_pct']}")
    print(f"Unique time deltas: {metrics['unique_time_deltas']}")

    print("\nMissing by column:")
    for k, v in metrics["missing_by_column"].items():
        print(f"  - {k}: {v}")

    print("\nNumeric summary:")
    for col, stats in metrics["numeric_summary"].items():
        print(f"  - {col}: {stats}")


def save_report(metrics: dict, out_path: Path):
    rows = []

    for k, v in metrics.items():
        if isinstance(v, dict):
            for subk, subv in v.items():
                rows.append({"metric": f"{k}.{subk}", "value": str(subv)})
        else:
            rows.append({"metric": k, "value": str(v)})

    out_path.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows).to_csv(out_path, index=False)


def main():
    parser = argparse.ArgumentParser(description="Run data quality checks for IoT time-series data.")
    parser.add_argument("--input", required=True, help="Input merged CSV/Excel file")
    parser.add_argument("--freq", default="15min", help="Expected frequency, default=15min")
    parser.add_argument("--output", required=False, help="Optional path to save quality report as CSV")
    args = parser.parse_args()

    df = load_data(Path(args.input))
    metrics = run_quality_checks(df, expected_freq=args.freq)
    print_report(metrics)

    if args.output:
        save_report(metrics, Path(args.output))
        print(f"\nSaved report to {args.output}")


if __name__ == "__main__":
    import sys

    sys.argv = [
        "data_quality_check.py",
        "--input", DEFAULT_INPUT_PATH,
        "--freq", DEFAULT_FREQ,
        "--output", DEFAULT_OUTPUT_PATH
    ]

    main()