import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        status: device.status,
        lastSeenAt: device.lastSeenAt,
        firmwareVersion: device.firmwareVersion
      } : null,
      current: latestReading ? {
        temperature: latestReading.temperature,
        humidity: latestReading.humidity,
        pressure: latestReading.pressure,
        weight: latestReading.weight,
        rain: latestReading.rain,
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
}
