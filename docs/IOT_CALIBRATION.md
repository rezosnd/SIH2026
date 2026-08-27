# HoneyChain Sensor Calibration Guide

## 1. DHT11 (Temperature / Humidity)
The DHT11 is factory calibrated. However, it has an accuracy of ±2°C and ±5% RH.
- **Action:** Compare readings with a known accurate thermometer.
- **Fix:** If consistently off by a static amount, you can add an offset in the ESP32 code (`float t = dht.readTemperature() - 1.5;`).

## 2. BMP180 (Atmospheric Pressure)
Factory calibrated. Pressure changes with altitude. 
- **Action:** If you wish to calculate absolute sea-level pressure, you must offset the reading based on your Hive's physical altitude (meters above sea level).

## 3. Rain Drop Sensor
The rain sensor outputs an analog voltage from 0 to VCC.
- **Dry Condition:** Reads around `4095` (on a 12-bit ADC).
- **Wet Condition:** Drops rapidly depending on the volume of water.
- **Calibration Steps:**
  1. Print `analogRead(34)` to the serial monitor.
  2. Record the value when dry.
  3. Place a drop of water on the sensor and record the value.
  4. Set the threshold in `main.cpp` midway between the dry and lightly-wet values (e.g., `2000`).

## 4. GUVA-S12SD (UV Sensor)
This sensor outputs a voltage linearly proportional to the UV index.
- **ESP32 ADC Mapping:** `Vout = analogRead(35) * (3.3 / 4095.0)`
- **UV Index Calculation:** According to the datasheet, `UV Index = Vout / 0.1V` (approximate, assuming 5V logic). Under 3.3V, you must verify the correlation using a calibrated UV meter outdoors.
- **Warning:** Do not claim scientific UV accuracy. Report the raw voltage or label it as "Estimated".

## 5. LM393 (Comparator Module)
The LM393 is a comparator. It outputs a digital signal when an analog threshold is crossed (set by the potentiometer on the board).
- **Calibration Steps:**
  1. Determine what physical sensor is actually attached (LDR/Light, Microphone/Sound, etc.).
  2. Turn the physical potentiometer (the blue box with a screw) until the green LED turns on exactly at your desired threshold.
  3. If reading Analog Output (AO), map the 0-4095 value to your specific use-case.

## 6. HX711 + Load Cell (Weight)
If installed, this requires exact calibration.
- **Calibration Steps:**
  1. Ensure the scale is completely empty.
  2. Call `scale.tare()` in the setup to zero the scale.
  3. Place a known weight (e.g., exactly `1.000 kg`) on the scale.
  4. Read the raw value using `scale.get_value(10)`.
  5. Calculate your calibration factor: `CALIBRATION_FACTOR = (raw_value) / (known_weight_kg)`.
  6. Update `CALIBRATION_FACTOR = X` in `main.cpp`.
  7. Test with a different weight (e.g., `500g`) to verify linearity.
