# HoneyChain IoT Troubleshooting Guide

## Problem: Mobile App shows "DEVICE OFFLINE" but ESP32 is powered on
**Possible Causes & Fixes:**
1. **Wi-Fi Issue:** The ESP32 cannot reach the internet. Check the Serial Monitor (115200 baud). If it says "Connecting to WiFi...", verify your SSID and password in `main.cpp`.
2. **MQTT Connection Refused:** Ensure the MQTT Broker URL and port are correct. If using a private broker, ensure `client.connect()` includes the correct username and password.
3. **Device-Hive Mismatch:** If the ESP32 is successfully publishing telemetry but the mobile app isn't updating, the backend is likely dropping the packets for security. Check the NestJS backend logs. Ensure the `DEVICE_ID` hardcoded in `main.cpp` exactly matches the `deviceId` assigned to that Hive in the PostgreSQL database.

## Problem: Mobile App shows "NO SENSOR READINGS AVAILABLE"
This means the backend has an active device registered, but 0 rows exist in the `SensorReading` table for it.
1. The ESP32 might be stuck in a boot loop. Check Serial Monitor.
2. The payload JSON format might be malformed, causing the NestJS payload validation to fail. Ensure `ArduinoJson` is serializing properly.

## Problem: A specific sensor (e.g. Temperature) shows N/A or ERROR
1. **Hardware Disconnect:** The physical wire to the sensor is loose.
2. **5V Logic Burnout:** If you plugged a 5V sensor directly into the ESP32 without a logic-level converter, the GPIO pin may be permanently burned out. Try assigning the sensor to a different pin in `main.cpp`.
3. **ADC Conflict:** Ensure you aren't using ADC2 pins (like GPIO 4 or 25) for `analogRead()` while Wi-Fi is active. Use ADC1 pins (32, 34, 35) for analog sensors.

## Problem: Weight shows as wild, fluctuating negative numbers
The HX711 is notoriously sensitive.
1. **Calibration:** You must perform the step-by-step calibration outlined in `IOT_CALIBRATION.md` to find your specific `CALIBRATION_FACTOR`.
2. **Interference:** Keep the wires between the load cell and the HX711 as short as possible to prevent electromagnetic interference. Ensure common ground is solidly connected.
