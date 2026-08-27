# HONEYCHAIN IoT HARDWARE TEST PLAN

This document outlines the rigorous end-to-end testing procedure to validate that physical hardware correctly pushes data through the MQTT/NestJS pipeline to the UI without fabricating data.

## TEST 1 — ESP32 BOOT & WIFI
1. Flash the ESP32.
2. Monitor Serial output.
3. **Expected:** ESP32 successfully connects to the configured Wi-Fi SSID and outputs an assigned local IP address.

## TEST 2 — DHT11 (TEMPERATURE & HUMIDITY)
1. Ensure the DHT11 data pin is connected to the firmware-configured GPIO.
2. Heat the sensor gently or blow on it.
3. **Expected:** ESP32 Serial prints rising temperature/humidity. The Mobile App Hive Details screen reflects the exact same reading in the TEMPERATURE and HUMIDITY cards.

## TEST 3 — BMP180 (PRESSURE)
1. Ensure I2C pins are connected (SDA, SCL).
2. **Expected:** ESP32 Serial prints pressure (e.g., ~1013 hPa). Mobile App shows the exact same reading. If BMP180 is disconnected, the UI gracefully falls back to "NOT AVAILABLE" and logs a Sensor Error.

## TEST 4 — RAIN SENSOR
1. Leave the sensor dry.
2. **Expected:** Mobile App shows `NO RAIN`.
3. Drop water on the sensor plate.
4. **Expected:** Mobile App instantly updates to `RAIN DETECTED`.

## TEST 5 — GUVA-S12SD (UV)
1. Expose the sensor to sunlight or a UV source.
2. **Expected:** The raw analog voltage increases. The Mobile UI displays the calibrated UV index or the raw UV voltage (if uncalibrated). 

## TEST 6 — LM393
1. Connect the LM393 module (e.g., with an LDR for light, or microphone for sound).
2. Adjust the potentiometer to set the trigger threshold.
3. Trigger the condition (e.g., shine a light).
4. **Expected:** Mobile UI displays the raw comparator state under "LM393 SENSOR INPUT".

## TEST 7 — LOAD CELL + HX711 (WEIGHT)
1. Ensure HX711 is wired to the designated DOUT and SCK pins.
2. Run the `tare` command on an empty hive scale.
3. Place a known 5kg weight.
4. If unavailable, completely disconnect the HX711.
5. **Expected:** The UI MUST explicitly render `WEIGHT SENSOR NOT CONNECTED` (red text). It must NEVER fabricate a weight reading like "42.5 kg".

## TEST 8 — DEVICE OFFLINE & RECONNECT
1. Power off the ESP32.
2. Wait for the server heartbeat threshold to expire.
3. **Expected:** Mobile UI status changes from `ONLINE` (green) to `OFFLINE` (red). The "Last Updated" timestamp freezes.
4. Power on the ESP32.
5. **Expected:** Device status returns to `ONLINE`.

## TEST 9 — ALERT NOTIFICATIONS
1. Manually inject a temperature of 40°C into the sensor (or simulate via API payload).
2. **Expected:** The NestJS Alert Engine traps the anomaly, creates a `HIGH_TEMPERATURE` HiveAlert, and fires an email to the configured administrator/beekeeper. The Mobile UI Alerts section renders the new alert immediately.

## FINAL SIGN-OFF
- [ ] ESP32 Boot
- [ ] Wi-Fi/MQTT Connectivity
- [ ] DHT11
- [ ] BMP180
- [ ] Rain Sensor
- [ ] GUVA-S12SD
- [ ] LM393
- [ ] Load Cell (if available)
- [ ] NestJS Validation
- [ ] Alert Triggering
- [ ] Mobile UI Rendering
