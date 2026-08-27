# HoneyChain IoT Architecture

This document describes the complete flow of data from the physical apiary to the user interfaces, detailing exactly how the ESP32 units securely transmit telemetry to the NestJS backend without data contamination.

## 1. Physical Hardware Layer
Each hive is equipped with an ESP32 microcontroller and a sensor array (DHT11, BMP180, Rain Drop, GUVA-S12SD UV, LM393, HX711 Load Cell, and an SSD1306 OLED display).
- **Device Identity:** Every ESP32 is flashed with a unique, hardcoded `DEVICE_ID` (e.g. `ESP32-HIVE-0001`).
- **Data Capture:** The `main.cpp` firmware polls all sensors periodically. If a sensor fails or is disconnected, it passes a `null` value without crashing the loop.

## 2. Secure Transport Layer (MQTT)
- **Protocol:** The ESP32 utilizes `PubSubClient` to connect to a secure MQTT Broker.
- **Topics:** 
  - Telemetry: `honeychain/hives/{hiveId}/telemetry`
  - Heartbeat: `honeychain/hives/{hiveId}/status`
- **Payload:** The data is packed into a compact JSON string containing `sequence`, `timestamp`, `deviceId`, and all valid sensor readings.

## 3. Backend Ingestion Layer (NestJS)
- **Subscription:** NestJS listens to the MQTT broker using the `@MessagePattern` decorator.
- **Strict Validation & Isolation:**
  - When a message arrives at `honeychain/hives/{hiveId}/telemetry`, the backend reads the `deviceId` from the payload.
  - It queries PostgreSQL to find the `IoTDevice` matching that ID.
  - It verifies that the `assignedHiveId` in the database matches the `{hiveId}` the payload is attempting to publish to.
  - **Attack Mitigation:** If `ESP32-001` (assigned to `Hive-A`) tries to publish to the topic for `Hive-B`, the backend throws a mismatch error and drops the packet. Data mixing is impossible.

## 4. Persistence Layer (PostgreSQL & Prisma)
- Telemetry that passes validation is saved as a new `SensorReading` row.
- The `IoTDevice` record has its `lastSeenAt` and `status` updated to `ONLINE`.
- The Alert engine checks the reading against predefined limits (e.g., Temperature > 38°C) and creates `HiveAlert` records if necessary, triggering push/email notifications.

## 5. UI Presentation Layer (Mobile & Web)
- **Zero Fake Data:** The REST API `GET /iot/hives/:hiveId` pulls exactly the latest `SensorReading` for the device mapped to that Hive.
- **Offline Detection:** If the `lastSeenAt` is too old (e.g., > 10 minutes), the backend explicitly flags the device as `OFFLINE`.
- **RBAC Security:** KVIC and Admin dashboards query the exact same PostgreSQL `SensorReading` table, but the Prisma queries strictly filter out hives that do not belong to the user's authorized Cluster or Organization.
