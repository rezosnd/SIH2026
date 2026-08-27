# ESP32 HIVE MONITORING HARDWARE WIRING

This document outlines the standard production GPIO wiring for the ESP32 (typically NodeMCU-32S or WROOM-32 layout) for the HoneyChain smart hive telemetry system.

**IMPORTANT:** Always verify the VCC voltage tolerance of your specific ESP32 breakout before directly connecting 5V inputs to the board. 

## Component Wiring Matrix

| COMPONENT | SENSOR PIN | ESP32 GPIO | POWER | GROUND | SIGNAL TYPE | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DHT11** | DATA | GPIO 4 | 3.3V / 5V | GND | Digital (1-Wire) | Use a 10kΩ pull-up resistor between DATA and VCC if using a bare sensor (not a breakout module). |
| **BMP180** | SDA | GPIO 21 | 3.3V | GND | I2C | Ensure standard I2C addresses are not conflicting. |
| **BMP180** | SCL | GPIO 22 | 3.3V | GND | I2C | Use 3.3V. BMP180 is not 5V tolerant on standard bare boards without logic shifters. |
| **Rain Sensor** | D0 | GPIO 13 | 3.3V / 5V | GND | Digital | Threshold configured via onboard potentiometer. LOW = Rain Detected (typically). |
| **Rain Sensor** | A0 | GPIO 34 (ADC1_CH6)| 3.3V / 5V | GND | Analog | Optional: Read raw analog resistance to predict rain intensity. |
| **GUVA-S12SD**| OUT | GPIO 35 (ADC1_CH7)| 3.3V / 5V | GND | Analog | Outputs 0-1V generally mapping to UV index. Calibrate voltage-to-index in firmware. |
| **LM393 Mod.** | D0 | GPIO 14 | 3.3V / 5V | GND | Digital | Used as a generic comparator. Adjust onboard potentiometer to set the trigger threshold. |
| **HX711 (Load)**| DOUT | GPIO 16 | 3.3V | GND | Digital Serial| Data output from the ADC. Must be calibrated with known weights. |
| **HX711 (Load)**| SCK | GPIO 17 | 3.3V | GND | Digital Clock | Clock pulse from ESP32 to read HX711 data. |

## Power Considerations
1. The ESP32 logic is **3.3V strictly**. Supplying a 5V logic signal directly into an ESP32 GPIO (e.g. from a 5V LM393 module) can damage the ADC/Digital pin over time. Use voltage dividers (logic level shifters) if 5V sensors are utilized.
2. Ensure you have a common ground (GND) across all components.

## Sensor Specifics & Fallbacks
* **DHT11 vs BMP180 Temp:** The DHT11 is treated as the primary hive climate source. The BMP180 acts solely as the Atmospheric Pressure source, ignoring its temperature output unless explicitly overridden in firmware.
* **LM393:** By default, it is a generic input module. Do not map its output to "sound" or "weight" unless specifically flashed for that purpose. In the API payload, send it as `lm393: <value>`.
* **HX711 Calibration:** Ensure you `tare` the hive scale empty, then place a known mass (e.g., 5kg) to derive the `calibrationFactor`. Do not transmit fake kg values.
