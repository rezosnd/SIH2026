import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Groq from 'groq-sdk';

@Injectable()
export class IoTService {
  constructor(private readonly prisma: PrismaService) { }

  async registerDevice(deviceId: string, hiveId: string) {
    return this.prisma.ioTDevice.upsert({
      where: { deviceId },
      update: { hiveId },
      create: { deviceId, hiveId, status: 'ONLINE', firmwareVersion: 'v1.0.0' }
    });
  }

  async ingestTelemetry(hiveId: string, payload: any) {
    const { deviceId, sensors, timestamp } = payload;
    if (!deviceId) throw new BadRequestException('deviceId required');
    if (!sensors) throw new BadRequestException('sensors required');

    // Verify device
    const device = await this.prisma.ioTDevice.findUnique({
      where: { deviceId }
    });
    if (!device) throw new NotFoundException('Device not found');
    if (device.hiveId !== hiveId) throw new ForbiddenException('Device not mapped to this hive');

    // Save reading
    const reading = await this.prisma.sensorReading.create({
      data: {
        deviceId,
        hiveId,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        temperature: sensors.temperature,
        humidity: sensors.humidity,
        pressure: sensors.pressure,
        rain: sensors.rain,
        uv: sensors.uv,
        weight: sensors.weight,
        lm393Value: sensors.lm393
      }
    });

    // Update device last seen
    await this.prisma.ioTDevice.update({
      where: { deviceId },
      data: {
        lastSeenAt: new Date(),
        status: 'ONLINE'
      }
    });

    // Simple Alert Engine Check
    if (sensors.temperature && (sensors.temperature > 38 || sensors.temperature < 10)) {
      await this.prisma.hiveAlert.create({
        data: {
          hiveId,
          deviceId,
          type: 'HIGH_TEMPERATURE',
          severity: 'HIGH',
          message: `Temperature anomaly detected: ${sensors.temperature}°C`,
        }
      });

      // Notify Beekeeper
      const hive = await this.prisma.hive.findUnique({ where: { id: hiveId } });
      if (hive) {
        await this.prisma.notification.create({
          data: {
            userId: hive.beekeeperId, // Actually BeekeeperProfile ID, we should get user.id ideally
            type: 'HIVE_ALERT',
            title: 'Critical Hive Temperature',
            message: `Hive ${hive.location} reported ${sensors.temperature}°C.`
          }
        });
      }
    }

    return { status: 'success', readingId: reading.id };
  }

  async getHiveDetails(hiveId: string, user: any) {
    const hive = await this.prisma.hive.findUnique({
      where: { id: hiveId },
      include: {
        beekeeper: true,
        device: true,
      }
    });

    if (!hive) throw new NotFoundException('Hive not found');

    // RBAC
    if (user.role === 'BEEKEEPER' && hive.beekeeper.userId !== user.id) {
      throw new ForbiddenException('Unauthorized hive access');
    }

    const device = hive.device;
    let latestReading = null;
    if (device) {
      latestReading = await this.prisma.sensorReading.findFirst({
        where: { deviceId: device.deviceId },
        orderBy: { timestamp: 'desc' }
      });
    }

    // Determine environmental score
    let score = 0;
    let envStatus = 'INSUFFICIENT DATA';
    if (latestReading && latestReading.temperature) {
      score = 80;
      envStatus = 'NORMAL';
      if (latestReading.temperature > 35) { score = 40; envStatus = 'ATTENTION'; }
    }

    const activeAlerts = await this.prisma.hiveAlert.findMany({
      where: { hiveId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      id: hive.id,
      location: hive.location,
      status: hive.status,
      installationDate: hive.registrationDate,
      beekeeper: hive.beekeeper.name,
      device: device ? {
        deviceId: device.deviceId,
        status: (device.lastSeenAt && (new Date().getTime() - device.lastSeenAt.getTime() < 120000)) ? 'ONLINE' : 'OFFLINE',
        lastSeenAt: device.lastSeenAt,
        firmwareVersion: device.firmwareVersion
      } : null,
      current: latestReading ? {
        temperature: latestReading.temperature,
        humidity: latestReading.humidity,
        pressure: latestReading.pressure,
        weight: latestReading.weight,
        rain: latestReading.rain ?? false,
        uv: latestReading.uv,
        lm393: latestReading.lm393Value,
        timestamp: latestReading.timestamp
      } : null,
      environment: {
        score,
        status: envStatus
      },
      alerts: activeAlerts
    };
  }

  async getHiveHistory(hiveId: string, range: string, user: any) {
    // Basic implementation for history
    const gte = new Date();
    if (range === '24H') gte.setHours(gte.getHours() - 24);
    else if (range === '7D') gte.setDate(gte.getDate() - 7);
    else if (range === '30D') gte.setDate(gte.getDate() - 30);
    else gte.setHours(gte.getHours() - 24);

    const readings = await this.prisma.sensorReading.findMany({
      where: {
        hiveId,
        timestamp: { gte }
      },
      orderBy: { timestamp: 'asc' },
    });

    return readings.map(r => ({
      t: r.timestamp,
      temp: r.temperature,
      hum: r.humidity,
      weight: r.weight
    }));
  }

  async getHiveAnalysis(hiveId: string, user: any, lang: string = 'English') {
    const hive = await this.prisma.hive.findUnique({
      where: { id: hiveId },
      include: { beekeeper: true, device: true }
    });

    if (!hive) throw new NotFoundException('Hive not found');
    if (user.role === 'BEEKEEPER' && hive.beekeeper.userId !== user.id) {
      throw new ForbiddenException('Unauthorized hive access');
    }

    const device = hive.device;
    let latest = null;
    let isStale = false;
    let isOnline = false;

    if (device) {
      latest = await this.prisma.sensorReading.findFirst({
        where: { deviceId: device.deviceId },
        orderBy: { timestamp: 'desc' }
      });
      isOnline = device.lastSeenAt ? (new Date().getTime() - device.lastSeenAt.getTime() < 120000) : false;
      if (latest) {
        // Data is stale if older than 15 minutes
        isStale = (new Date().getTime() - latest.timestamp.getTime()) > 15 * 60 * 1000;
      }
    }

    // 1. SENSOR HEALTH STATUS & DATA QUALITY
    const sensorHealth = {
      dht11: 'NOT CONNECTED',
      bmp180: 'NOT CONNECTED',
      rainDrop: 'NOT CONNECTED',
      uv: 'NOT CONNECTED',
      loadCell: 'NOT CONNECTED'
    };

    let validSensors = 0;
    const totalSensors = 5;

    if (latest) {
      if (!isOnline) {
        sensorHealth.dht11 = 'OFFLINE';
        sensorHealth.bmp180 = 'OFFLINE';
        sensorHealth.rainDrop = 'OFFLINE';
        sensorHealth.uv = 'OFFLINE';
        sensorHealth.loadCell = 'OFFLINE';
      } else {
        if (latest.temperature != null && latest.humidity != null) { sensorHealth.dht11 = 'ONLINE'; validSensors++; } else { sensorHealth.dht11 = 'ERROR'; }
        if (latest.pressure != null) { sensorHealth.bmp180 = 'ONLINE'; validSensors++; } else { sensorHealth.bmp180 = 'ERROR'; }
        if (latest.rain != null) { sensorHealth.rainDrop = 'ONLINE'; validSensors++; } else { sensorHealth.rainDrop = 'ERROR'; }
        if (latest.uv != null) { sensorHealth.uv = 'ONLINE'; validSensors++; } else { sensorHealth.uv = 'ERROR'; }
        if (latest.weight != null) { sensorHealth.loadCell = 'ONLINE'; validSensors++; } else { sensorHealth.loadCell = 'NOT CONNECTED'; }
      }
    }

    const dataQualityPct = Math.round((validSensors / totalSensors) * 100);

    // 2. DETERMINISTIC RULE-BASED SCORE
    let ruleScore = 0;
    let envStatus = 'INSUFFICIENT DATA';

    if (latest && validSensors >= 3) {
      let tempScore = 100;
      if (latest.temperature != null) {
        if (latest.temperature > 35 || latest.temperature < 10) tempScore = 40;
        else if (latest.temperature > 32 || latest.temperature < 15) tempScore = 70;
      }

      let humScore = 100;
      if (latest.humidity != null) {
        if (latest.humidity > 80 || latest.humidity < 30) humScore = 50;
      }

      ruleScore = Math.round((tempScore * 0.6) + (humScore * 0.4));
      
      if (ruleScore >= 80) envStatus = 'STABLE';
      else if (ruleScore >= 60) envStatus = 'ATTENTION';
      else if (ruleScore >= 40) envStatus = 'WARNING';
      else envStatus = 'CRITICAL';
    } else if (validSensors > 0) {
      envStatus = 'LIMITED DATA';
    }

    let aiResult = null;

    // 3. GROQ AI ANALYSIS
    if (latest && validSensors >= 3 && process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const promptContext = {
        hiveId: hive.id,
        location: hive.location,
        timestamp: latest.timestamp,
        isStale,
        readings: {
          temperature: latest.temperature,
          humidity: latest.humidity,
          pressure: latest.pressure,
          rain: latest.rain ? 'DETECTED' : 'NO RAIN',
          uv: latest.uv,
          weight: latest.weight
        },
        sensorHealth,
        ruleBasedStatus: envStatus,
        ruleBasedScore: ruleScore
      };

      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are an expert apiary AI analyst. Analyze the provided IoT sensor data. Output ONLY a valid JSON object matching the requested schema. DO NOT invent sensor data if it is null/unavailable. Do not claim diseases without strong evidence. Ensure you distinguish between "OBSERVED", "POSSIBLE", and "UNKNOWN". IMPORTANT: Output all descriptive text (summary, alerts, recommendations, sensorIssues, hiveRisk, productivityImpact, dataQuality, reasoning) in ${lang}. DO NOT translate the JSON keys. The keys MUST remain exactly as specified in English.`
            },
            {
              role: 'user',
              content: `Analyze this hive data and return a JSON object with this exact structure: {"environmentStatus":"Good|Attention|Warning|Critical","confidence":0-100,"summary":"Brief summary","alerts":["alert 1"],"recommendations":["rec 1"],"sensorIssues":["issue 1"],"hiveRisk":"description","productivityImpact":"description","dataQuality":"description","reasoning":"detailed reasoning"}. IMPORTANT: 'alerts', 'recommendations', and 'sensorIssues' MUST be JSON arrays of strings. Data: ${JSON.stringify(promptContext)}`
            }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });

        let content = chatCompletion.choices[0]?.message?.content;
        if (content) {
          content = content.replace(/```json/g, '').replace(/```/g, '').trim();
          aiResult = JSON.parse(content);
        }
      } catch (err: any) {
        console.error("Groq API Error:", err);
        aiResult = { error: `AI Analysis temporarily unavailable. Details: ${err.message || 'Parse Error'}` };
      }
    } else if (!process.env.GROQ_API_KEY) {
      aiResult = { error: "AI Analysis not configured." };
    } else {
      aiResult = { error: "Insufficient sensor data for AI analysis." };
    }

    return {
      success: true,
      dataQuality: {
        percentage: dataQualityPct,
        validSensors,
        totalSensors,
        isStale
      },
      sensorHealth,
      ruleBasedAnalysis: {
        score: validSensors >= 3 ? ruleScore : null,
        status: envStatus,
        message: validSensors >= 3 ? 'Analysis successful based on available data.' : 'Insufficient data for a complete deterministic score.'
      },
      aiAssessment: aiResult
    };
  }
}
