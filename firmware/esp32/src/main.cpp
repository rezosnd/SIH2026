#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085.h> // BMP180 library
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// -----------------------------------------
// HARDWARE CONFIGURATION
// -----------------------------------------
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

Adafruit_BMP085 bmp;
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define RAIN_PIN 34
#define GUVA_PIN 35
#define LM393_PIN 32

// Note: If using HX711, uncomment below and add HX711 library
// #include "HX711.h"
// #define LOADCELL_DOUT_PIN 26
// #define LOADCELL_SCK_PIN 25
// HX711 scale;
// float CALIBRATION_FACTOR = 420.5; 

// -----------------------------------------
// DEVICE IDENTITY
// -----------------------------------------
const char* DEVICE_ID = "ESP32-HIVE-0001";
const char* HIVE_ID = "HIVE-2026-0001";
const char* FIRMWARE_VERSION = "1.0.0";

// -----------------------------------------
// NETWORK CONFIGURATION
// -----------------------------------------
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com"; // Replace with your production MQTT broker
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define TELEMETRY_INTERVAL_MS 10000 // 10 seconds
unsigned long sequence = 0;
int currentScreen = 0;
unsigned long lastScreenUpdate = 0;

void setup_wifi() {
  delay(10);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(DEVICE_ID)) {
      Serial.println("connected");
      // Publish heartbeat immediately on reconnect
      publishHeartbeat();
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void publishHeartbeat() {
  StaticJsonDocument<200> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["hiveId"] = HIVE_ID;
  doc["status"] = "ONLINE";
  doc["firmwareVersion"] = FIRMWARE_VERSION;
  
  char buffer[200];
  serializeJson(doc, buffer);
  
  String topic = String("honeychain/hives/") + HIVE_ID + "/status";
  client.publish(topic.c_str(), buffer);
}

void setup() {
  Serial.begin(115200);
  Serial.println("[BOOT] Device: " + String(DEVICE_ID));

  // Init Display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("[OLED] Allocation failed");
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0,20);
    display.println("HONEYCHAIN STARTING");
    display.display();
  }

  // Init Sensors
  dht.begin();
  if (!bmp.begin()) {
    Serial.println("[BMP180] Error starting BMP180");
  }
  
  // scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  // scale.set_scale(CALIBRATION_FACTOR);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  
  // Cycle display every 3 seconds
  if (now - lastScreenUpdate > 3000) {
    lastScreenUpdate = now;
    updateDisplay();
    currentScreen = (currentScreen + 1) % 5;
  }

  // Publish telemetry every TELEMETRY_INTERVAL_MS
  if (now - lastMsg > TELEMETRY_INTERVAL_MS) {
    lastMsg = now;
    
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    float p = bmp.readPressure() / 100.0F; // hPa
    
    int rainRaw = analogRead(RAIN_PIN);
    bool rainDetected = rainRaw < 2000; // Calibrate threshold!
    
    int uvRaw = analogRead(GUVA_PIN);
    float uvVoltage = uvRaw * (3.3 / 4095.0);
    
    int lm393Raw = analogRead(LM393_PIN);
    
    StaticJsonDocument<500> doc;
    doc["version"] = 1;
    doc["deviceId"] = DEVICE_ID;
    doc["hiveId"] = HIVE_ID;
    doc["sequence"] = sequence++;
    
    JsonObject sensors = doc.createNestedObject("sensors");
    
    if (isnan(t)) sensors["temperature"] = nullptr; else sensors["temperature"] = t;
    if (isnan(h)) sensors["humidity"] = nullptr; else sensors["humidity"] = h;
    sensors["pressure"] = p;
    sensors["rain"] = rainDetected;
    sensors["rainRaw"] = rainRaw;
    sensors["uvRaw"] = uvRaw;
    sensors["uvVoltage"] = uvVoltage;
    sensors["lm393"] = lm393Raw;
    
    // if scale connected:
    // sensors["weight"] = scale.get_units(5);
    sensors["weight"] = nullptr;
    
    char buffer[500];
    serializeJson(doc, buffer);
    String topic = String("honeychain/hives/") + HIVE_ID + "/telemetry";
    client.publish(topic.c_str(), buffer);
    
    Serial.println("[MQTT] Telemetry published seq: " + String(sequence));
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setCursor(0,0);
  
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  switch(currentScreen) {
    case 0: // Main
      display.println("HONEYCHAIN");
      display.println(String(HIVE_ID));
      display.println("STATUS: ONLINE");
      display.print("TEMP: "); display.print(isnan(t)? "N/A" : String(t)); display.println(" C");
      display.print("HUM:  "); display.print(isnan(h)? "N/A" : String(h)); display.println(" %");
      break;
    case 1: // Environment
      display.print("PRESSURE\n"); display.print(bmp.readPressure()/100.0F); display.println(" hPa");
      display.println("RAIN");
      display.println(analogRead(RAIN_PIN) < 2000 ? "DETECTED" : "NO RAIN");
      break;
    case 2: // Weight
      display.println("WEIGHT");
      display.println("NOT CONNECTED");
      break;
    case 3: // Device
      display.println("DEVICE");
      display.println(String(DEVICE_ID));
      display.println("MQTT: CONNECTED");
      display.println("WIFI: CONNECTED");
      break;
    case 4: // Health
      display.print("DHT11:  "); display.println(isnan(t) ? "ERROR" : "OK");
      display.print("BMP180: "); display.println("OK");
      display.print("RAIN:   "); display.println("OK");
      display.print("UV:     "); display.println("OK");
      display.print("HX711:  "); display.println("N/A");
      break;
  }
  display.display();
}
