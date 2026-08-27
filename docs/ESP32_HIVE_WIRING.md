# HoneyChain ESP32 Hive Unit Wiring Guide

## ⚠️ CRITICAL WARNINGS
- **Logic Level:** The ESP32 operates at **3.3V logic**. DO NOT connect 5V logic signals directly to the ESP32 GPIOs without a logic level converter or voltage divider, or you will permanently damage the microcontroller.
- **Common Ground:** All sensors must share a common ground (GND) with the ESP32.
- **Power Draw:** If your sensors combined draw more than the ESP32's onboard 3.3V regulator can supply (typically ~500mA maximum depending on the board), use an external 3.3V power supply (remember to tie the grounds together).

---

## 📍 Pinout Map

| Module / Sensor | Pin on Module | ESP32 GPIO | Notes / Warnings |
| :--- | :--- | :--- | :--- |
| **DHT11** (Temp/Hum) | DATA | `GPIO 4` | Needs a 10kΩ pull-up resistor if using a bare sensor (not a breakout board). |
| | VCC | `3.3V` | Use 3.3V power. |
| | GND | `GND` | |
| **BMP180** (Pressure) | SDA | `GPIO 21` | I2C Bus. Make sure your breakout board is 3.3V compatible. |
| | SCL | `GPIO 22` | I2C Bus. |
| | VCC | `3.3V` | Do NOT power with 5V unless board has an LDO regulator. |
| | GND | `GND` | |
| **OLED (SSD1306)** | SDA | `GPIO 21` | Shares I2C with BMP180 (different address `0x3C`). |
| | SCL | `GPIO 22` | Shares I2C with BMP180. |
| | VCC | `3.3V` | |
| | GND | `GND` | |
| **Rain Sensor** | AO (Analog) | `GPIO 34` | Input only. Uses ADC1. Dry = ~4095, Wet = Lower. |
| | DO (Digital) | `NC` | Not connected. We use Analog for granular readings. |
| | VCC | `3.3V` | |
| | GND | `GND` | |
| **GUVA-S12SD (UV)** | OUT (Analog) | `GPIO 35` | Input only. Uses ADC1. Must calibrate voltage to UV Index. |
| | VCC | `3.3V` | |
| | GND | `GND` | |
| **LM393** (Misc) | AO (Analog) | `GPIO 32` | Uses ADC1. |
| | DO (Digital) | `NC` | Depends on the physical sensor attached to the LM393. |
| | VCC | `3.3V` | |
| | GND | `GND` | |
| **HX711 (Load Cell)** | DT (Data) | `GPIO 26` | Ensure HX711 VCC is 3.3V so DT outputs 3.3V logic. |
| *(If Installed)* | SCK (Clock) | `GPIO 25` | |
| | VCC | `3.3V` | Connect Load Cell wires (Red/Blk/Wht/Grn) to HX711 E+/E-/A-/A+ exactly per datasheet. |
| | GND | `GND` | |

## 🚫 ADC & Wi-Fi Conflict Notice
Do not use **ADC2 pins** (GPIOs 2, 4, 12-15, 25-27) for *analog readings* (`analogRead()`) while Wi-Fi is active. ADC2 is shared with the Wi-Fi driver on ESP32. We have intentionally selected ADC1 pins (34, 35, 32) for our analog sensors (Rain, GUVA, LM393) to avoid this hardware conflict.
