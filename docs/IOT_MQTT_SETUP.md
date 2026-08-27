# HoneyChain MQTT Configuration Guide

## Production Requirements
In development, testing with `broker.hivemq.com` (public unauthenticated broker) is acceptable for verifying ESP32 wiring. However, in production, HoneyChain mandates an authenticated, private MQTT broker (such as AWS IoT Core, Eclipse Mosquitto, or HiveMQ Cloud).

## Backend Configuration (NestJS)
Your NestJS `.env` must contain the following variables. Do NOT commit the actual `.env` file to source control.

```env
MQTT_BROKER_URL=mqtts://your-private-broker.com
MQTT_PORT=8883
MQTT_USERNAME=honeychain_backend
MQTT_PASSWORD=your_secure_password
```

## ESP32 Firmware Configuration
Update `firmware/esp32/src/main.cpp` before flashing. 
If using TLS (Port 8883), you must switch `WiFiClient` to `WiFiClientSecure` and supply the broker's Root CA certificate.

```cpp
const char* mqtt_server = "your-private-broker.com";
const int mqtt_port = 1883; // Use 8883 for TLS
const char* mqtt_user = "esp32_hive_001";
const char* mqtt_password = "secure_device_password";

// In setup():
// client.connect(DEVICE_ID, mqtt_user, mqtt_password)
```

## Security Best Practices
- **Never** expose the `MQTT_PASSWORD` in the React Native or Next.js frontend code. The frontend should *only* retrieve telemetry via standard HTTP/JWT REST calls to NestJS.
- **Isolate Credentials:** If your broker supports it, create a unique MQTT username/password for every physical ESP32 device, restricted to only publish to their specific `honeychain/hives/{hiveId}/#` topic.
