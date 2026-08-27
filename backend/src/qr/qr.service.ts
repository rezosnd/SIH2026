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

    let isSuspicious = false;
    let riskReason = '';

    const recentScans = container.scans;
    const now = new Date();

    // Rule 1: Scan Frequency (e.g., > 5 scans in 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    const scansInLast5Mins = recentScans.filter((s) => s.timestamp > fiveMinutesAgo);
    
    if (scansInLast5Mins.length >= 5) {
      isSuspicious = true;
      riskReason = 'Excessive scans in short time period.';
    }

    // Rule 2: Unrealistic Geographic Movement (e.g. different city within 2 hours)
    if (!isSuspicious && recentScans.length > 0) {
      const lastScan = recentScans[0];
      const twoHoursAgo = new Date(now.getTime() - 2 * 3600000);
      
      if (lastScan.timestamp > twoHoursAgo) {
        if (locationData.city && lastScan.city && locationData.city !== lastScan.city) {
          isSuspicious = true;
          riskReason = `Unrealistic geographic movement from ${lastScan.city} to ${locationData.city}.`;
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

    // If suspicious, create alerts
    if (isSuspicious) {
      // Create admin notification
      await this.prisma.notification.create({
        data: {
          type: 'QR_SUSPICIOUS_LOCATION',
          title: 'Suspicious QR Activity Detected',
          message: `QR ${qrData} (Batch ${container.batchId}) flagged: ${riskReason}`,
        },
      });

      // Log to Audit Log
      await this.prisma.auditLog.create({
        data: {
          action: 'QR_SCANNED',
          resource: qrData,
          metadata: JSON.stringify({ riskLevel: 'HIGH', reason: riskReason }),
        },
      });
    }

    return {
      status: isSuspicious ? 'SUSPICIOUS' : 'VERIFIED',
      scan,
      container: {
        batchId: container.batchId,
        size: container.containerSize,
      }
    };
  }
}
