#include <Wire.h>
#include "Adafruit_SHT31.h"
#include "FS.h"
#include "LittleFS.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

// ======================================================
// Hardware config
// ======================================================
#define I2C_SDA 41
#define I2C_SCL 42
#define SHT31_ADDR 0x44

// ======================================================
// Sampling / retry config
// ======================================================
const uint32_t SAMPLE_INTERVAL_MS = 300000UL;        // 5 minutes
const uint32_t RETRY_PENDING_INTERVAL_MS = 300000UL; // retry every 5 minutes

// ======================================================
// Wi-Fi / upload config
// ======================================================
const char* WIFI_SSID = "GlideB608";
const char* WIFI_PASS = "19911005";
const char* INGEST_URL = "http://10.131.150.6:5000/ingest";

// ======================================================
// Time sync config (UTC)
// ======================================================
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = 0;
const int DAYLIGHT_OFFSET_SEC = 0;

// ======================================================
// Globals
// ======================================================
Adafruit_SHT31 sht31 = Adafruit_SHT31();

uint32_t lastSampleMs = 0;
uint32_t lastRetryPendingMs = 0;
uint32_t recordId = 0;

// ======================================================
// File paths
// ======================================================
const char* PENDING_FILE = "/pending_upload.csv";

// ======================================================
// Utility functions
// ======================================================
String currentIsoTimestampUTC() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo, 3000)) {
    return "";
  }

  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buf);
}

String currentDayFilePath() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo, 3000)) {
    return "/unknown_day.csv";
  }

  char buf[20];
  strftime(buf, sizeof(buf), "/%Y-%m-%d.csv", &timeinfo);
  return String(buf);
}

bool fileExists(const String &path) {
  return LittleFS.exists(path);
}

void appendLine(const String &path, const String &line) {
  File f = LittleFS.open(path, "a");
  if (!f) {
    Serial.println("ERROR: failed to open file for append: " + path);
    return;
  }
  f.println(line);
  f.close();
}

void overwriteFile(const String &path, const String &content) {
  File f = LittleFS.open(path, "w");
  if (!f) {
    Serial.println("ERROR: failed to open file for overwrite: " + path);
    return;
  }
  f.print(content);
  f.close();
}

void ensureHeader(const String &path, const String &header) {
  if (!fileExists(path)) {
    appendLine(path, header);
  }
}

void listFiles() {
  File root = LittleFS.open("/");
  File file = root.openNextFile();
  while (file) {
    Serial.printf("FILE: %s SIZE: %d\n", file.name(), (int)file.size());
    file = root.openNextFile();
  }
}

// ======================================================
// Wi-Fi / NTP
// ======================================================
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.print("Connecting to WiFi");
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed");
  }
}

void syncTimeNTP() {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);

  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 10000)) {
    Serial.println("NTP time synced");
  } else {
    Serial.println("WARNING: NTP sync failed");
  }
}

// ======================================================
// Sensor reading
// ======================================================
bool readSHT31(float &temperatureC, float &humidityPct) {
  for (int attempt = 1; attempt <= 3; attempt++) {
    temperatureC = sht31.readTemperature();
    humidityPct = sht31.readHumidity();

    if (!isnan(temperatureC) && !isnan(humidityPct)) {
      return true;
    }
    delay(60);
  }

  Wire.end();
  delay(80);
  Wire.begin(I2C_SDA, I2C_SCL);
  delay(180);

  if (!sht31.begin(SHT31_ADDR)) {
    return false;
  }
  delay(100);

  temperatureC = sht31.readTemperature();
  humidityPct = sht31.readHumidity();

  return (!isnan(temperatureC) && !isnan(humidityPct));
}

// ======================================================
// JSON upload
// ======================================================
String buildJsonPayload(uint32_t rid, const String &timestamp, float tempC, float humidityPct) {
  String json = "{";
  json += "\"record_id\":" + String(rid) + ",";
  json += "\"timestamp\":\"" + timestamp + "\",";
  json += "\"temp_c\":" + String(tempC, 2) + ",";
  json += "\"humidity_pct\":" + String(humidityPct, 2);
  json += "}";
  return json;
}

bool postJson(const String &jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(jsonPayload);
  String response = http.getString();
  http.end();

  if (httpCode >= 200 && httpCode < 300) {
    Serial.println("Upload success");
    Serial.println(response);
    return true;
  } else {
    Serial.printf("Upload failed. HTTP %d\n", httpCode);
    if (response.length() > 0) {
      Serial.println(response);
    }
    return false;
  }
}

// ======================================================
// Pending queue handling
// ======================================================
void ensurePendingHeader() {
  ensureHeader(PENDING_FILE, "record_id,timestamp,temp_c,humidity_pct");
}

void enqueuePending(uint32_t rid, const String &timestamp, float tempC, float humidityPct) {
  ensurePendingHeader();
  String line = String(rid) + "," + timestamp + "," + String(tempC, 2) + "," + String(humidityPct, 2);
  appendLine(PENDING_FILE, line);
  Serial.println("Queued for retry: " + line);
}

bool uploadSinglePendingCsvLine(const String &line) {
  int p1 = line.indexOf(',');
  int p2 = line.indexOf(',', p1 + 1);
  int p3 = line.indexOf(',', p2 + 1);

  if (p1 < 0 || p2 < 0 || p3 < 0) {
    return false;
  }

  uint32_t rid = line.substring(0, p1).toInt();
  String timestamp = line.substring(p1 + 1, p2);
  float tempC = line.substring(p2 + 1, p3).toFloat();
  float humidityPct = line.substring(p3 + 1).toFloat();

  String jsonPayload = buildJsonPayload(rid, timestamp, tempC, humidityPct);
  return postJson(jsonPayload);
}

void retryPendingUploads() {
  if (!fileExists(PENDING_FILE)) return;
  if (WiFi.status() != WL_CONNECTED) return;

  File f = LittleFS.open(PENDING_FILE, "r");
  if (!f) {
    Serial.println("ERROR: failed to open pending queue");
    return;
  }

  String survivors = "record_id,timestamp,temp_c,humidity_pct\n";
  bool firstLine = true;
  int total = 0;
  int success = 0;

  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();

    if (line.length() == 0) continue;

    if (firstLine) {
      firstLine = false;
      if (line == "record_id,timestamp,temp_c,humidity_pct") {
        continue;
      }
    }

    total++;

    if (uploadSinglePendingCsvLine(line)) {
      success++;
      delay(100);
    } else {
      survivors += line + "\n";
    }
  }

  f.close();
  overwriteFile(PENDING_FILE, survivors);

  Serial.printf("Pending retry done. total=%d success=%d remaining=%d\n",
                total, success, total - success);
}

// ======================================================
// Local logging
// ======================================================
void logMeasurementToDailyCsv(uint32_t rid, const String &timestamp, float tempC, float humidityPct) {
  String path = currentDayFilePath();
  ensureHeader(path, "record_id,timestamp,temp_c,humidity_pct");

  String line = String(rid) + "," + timestamp + "," + String(tempC, 2) + "," + String(humidityPct, 2);
  appendLine(path, line);
}

void logFailureRow(uint32_t rid, const String &timestamp) {
  String path = currentDayFilePath();
  ensureHeader(path, "record_id,timestamp,temp_c,humidity_pct");

  String line = String(rid) + "," + timestamp + ",NaN,NaN";
  appendLine(path, line);
}

// ======================================================
// Serial export commands
// ======================================================
void dumpFile(const char *pathRaw) {
  String path = String(pathRaw);
  if (!path.startsWith("/")) path = "/" + path;

  File f = LittleFS.open(path, "r");
  if (!f) {
    Serial.println("ERROR: cannot open " + path);
    return;
  }

  Serial.println("-----BEGIN " + path + "-----");
  while (f.available()) {
    Serial.write(f.read());
  }
  Serial.println("\n-----END " + path + "-----");
  f.close();
}

void dumpAll() {
  File root = LittleFS.open("/");
  File file = root.openNextFile();

  while (file) {
    dumpFile(file.name());
    file = root.openNextFile();
  }

  Serial.println("DUMPALL_DONE");
}

void handleSerialCommands() {
  if (!Serial.available()) return;

  String cmd = Serial.readStringUntil('\n');
  cmd.trim();

  if (cmd == "LIST") {
    listFiles();
  } else if (cmd == "DUMPALL") {
    dumpAll();
  } else if (cmd.startsWith("DUMP ")) {
    String path = cmd.substring(5);
    dumpFile(path.c_str());
  } else {
    Serial.println("Commands: LIST | DUMP <path> | DUMPALL");
  }
}

// ======================================================
// Setup
// ======================================================
void setup() {
  Serial.begin(115200);
  delay(1200);

  Wire.begin(I2C_SDA, I2C_SCL);
  delay(250);

  if (!sht31.begin(SHT31_ADDR)) {
    Serial.println("ERROR: SHT31 not found at 0x44. Check wiring.");
    while (1) delay(50);
  }
  Serial.println("SHT31 OK");

  if (!LittleFS.begin()) {
    Serial.println("ERROR: LittleFS mount failed.");
    while (1) delay(50);
  }
  Serial.println("LittleFS OK");
  Serial.printf("LittleFS Total: %u bytes\n", LittleFS.totalBytes());
  Serial.printf("LittleFS Used : %u bytes\n", LittleFS.usedBytes());

  ensurePendingHeader();

  connectWiFi();
  if (WiFi.status() == WL_CONNECTED) {
    syncTimeNTP();
  }

  Serial.println("System ready");
  Serial.println("Sampling interval: 5 minutes");
  Serial.println("Commands: LIST | DUMP <path> | DUMPALL");
}

// ======================================================
// Main loop
// ======================================================
void loop() {
  handleSerialCommands();

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  uint32_t now = millis();

  if (lastSampleMs == 0 || (now - lastSampleMs) >= SAMPLE_INTERVAL_MS) {
    lastSampleMs = now;

    float tempC, humidityPct;
    String timestamp = currentIsoTimestampUTC();

    if (timestamp == "") {
      recordId++;
      logFailureRow(recordId, "NO_TIME");
      Serial.println("WARNING: no valid NTP time yet, logged NO_TIME row");
      return;
    }

    recordId++;

    if (!readSHT31(tempC, humidityPct)) {
      Serial.println("ERROR: sensor read failed after retry/re-init");
      logFailureRow(recordId, timestamp);
      return;
    }

    logMeasurementToDailyCsv(recordId, timestamp, tempC, humidityPct);

    String jsonPayload = buildJsonPayload(recordId, timestamp, tempC, humidityPct);
    if (!postJson(jsonPayload)) {
      enqueuePending(recordId, timestamp, tempC, humidityPct);
    }
  }

  if (lastRetryPendingMs == 0 || (now - lastRetryPendingMs) >= RETRY_PENDING_INTERVAL_MS) {
    lastRetryPendingMs = now;
    retryPendingUploads();
  }

  delay(50);
}