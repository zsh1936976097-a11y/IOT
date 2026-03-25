# Indoor Comfort Monitor (ELEC70126 IoT Coursework)

This repository contains the code, data, analysis notebook, and UI prototype for my **ELEC70126 Internet of Things and Applications** coursework at **Imperial College London**.

The project develops an end-to-end **Indoor Comfort Monitor** for a student room in White City, London. It combines:

- a custom indoor sensing node based on **Heltec LoRa32 (ESP32-S3) + SHT31**
- local data logging and upload via HTTP
- a local **Flask receiver** for sensor data ingestion
- **Open-Meteo** outdoor weather data
- a 15-minute aligned merged dataset for time-series analysis
- an interactive **UI prototype** for comfort monitoring and decision support

## Project objective

The system was designed to:

1. automatically collect and store continuous indoor sensing data,
2. integrate indoor and outdoor time-series data on a common timeline,
3. analyse comfort, lagged weather effects, and short-horizon forecasting,
4. present the results through a user-facing monitoring interface.

## Repository structure

```text
.
├── sensing/
│   ├── esp32_sensor_main.ino
│   ├── receiver_server.py
│   ├── fetch_openmeteo.py
│   ├── merge_align_15min.py
│   ├── data_quality_check.py
│   └── basic_characteristics.py
│
├── analysis/
│   ├── iot_data_analysis.ipynb
│   └── analysis_outputs_main/
│
├── data/
│   └── merged_data.csv
│
├── UI/
│   ├── UI_DEMO_LINK.md
│   └── Indoor Comfort Monitor UI/
│       ├── guidelines/
│       ├── src/
│       ├── README.md
│       ├── ATTRIBUTIONS.md
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.mjs
│       └── vite.config.ts
│
└── README.md
