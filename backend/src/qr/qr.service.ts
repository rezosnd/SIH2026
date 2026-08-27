import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LocationData {
  city?: string;
  state?: string;
  country?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async recordScan(qrData: string, locationData: LocationData) {
    const container = await this.prisma.batchContainer.findUnique({
      where: { qrData },
      include: {
        scans: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        batch: true,
      },
    });

    if (!container) {
      throw new NotFoundException('Invalid QR Code');
    }

    // Check if QR has been revoked
    if ((container as any).revokedAt) {
      return { status: 'REVOKED', message: 'This QR code has been revoked by the administrator.' };
    }

    let isSuspicious = false;
    let riskReason = '';
    let previousCity: string | undefined;
    let timeDiffMinutes: number | undefined;

    const recentScans = container.scans;
    const now = new Date();

    // Rule 1: Scan Frequency (> 2 scans in 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    const scansInLast5Mins = recentScans.filter((s) => s.timestamp > fiveMinutesAgo);
    
    // For demo purposes, we trigger on just 2 scans!
    if (scansInLast5Mins.length >= 2) {
      isSuspicious = true;
      riskReason = 'Excessive scans in short time period (Multiple Scans Detected).';
    }

    // Rule 2: Unrealistic Geographic Movement (different city within 2 hours)
    if (!isSuspicious && recentScans.length > 0) {
      const lastScan = recentScans[0];
      const twoHoursAgo = new Date(now.getTime() - 2 * 3600000);
      
      if (lastScan.timestamp > twoHoursAgo) {
        if (locationData.city && lastScan.city && locationData.city !== lastScan.city) {
          isSuspicious = true;
          previousCity = lastScan.city;
          timeDiffMinutes = Math.round((now.getTime() - lastScan.timestamp.getTime()) / 60000);
          riskReason = `Unrealistic geographic movement from ${lastScan.city} to ${locationData.city} in ${timeDiffMinutes} minutes.`;
        }
      }
    }

    // Record the scan
    const scan = await this.prisma.qRScan.create({
      data: {
        containerId: container.id,
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
        ipAddress: locationData.ipAddress,
        userAgent: locationData.userAgent,
        isSuspicious,
      },
    });

    // If suspicious, create SecurityAlert + notifications
    if (isSuspicious) {
      // Create SecurityAlert record
      await (this.prisma as any).securityAlert.create({
        data: {
          containerId: container.id,
          scanId: scan.id,
          previousCity: previousCity,
          currentCity: locationData.city,
          timeDiffMinutes: timeDiffMinutes,
          riskLevel: 'HIGH',
          reason: riskReason,
          status: 'OPEN',
        },
      });

      // Create admin notification
      await this.prisma.notification.create({
        data: {
          type: 'QR_SUSPICIOUS_LOCATION',
          title: 'Suspicious QR Activity Detected',
          message: `QR flagged on Batch ${container.batchId}: ${riskReason}`,
        },
      });

      // Log to Audit Log
      await this.prisma.auditLog.create({
        data: {
          action: 'QR_SUSPICIOUS_SCAN',
          resource: container.id,
          metadata: JSON.stringify({ riskLevel: 'HIGH', reason: riskReason, city: locationData.city }),
        },
      });
    }

    return {
      status: isSuspicious ? 'SUSPICIOUS' : 'VERIFIED',
      riskLevel: isSuspicious ? 'HIGH' : 'NONE',
      riskReason: isSuspicious ? riskReason : undefined,
      scan,
      container: {
        id: container.id,
        batchId: container.batchId,
        size: container.containerSize,
      }
    };
  }
}
