import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

interface LocationData {
  city?: string;
  state?: string;
  country?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class QrService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    // Create a generic transporter for demo purposes
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });
  }

  async sendSuspiciousAlertEmail(batchId: string, reason: string, city?: string) {
    try {
      if (!process.env.SMTP_USER) {
        console.log(`[EMAIL MOCK] Sending alert to rehansuman41008@gmail.com: Batch ${batchId} compromised! Reason: ${reason}`);
        return;
      }
      
      await this.transporter.sendMail({
        from: '"HoneyChain Security" <security@honeychain.com>',
        to: 'rehansuman41008@gmail.com',
        subject: '⚠️ HIGH RISK: Suspicious QR Activity Detected',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ffcccc; background-color: #fff5f5;">
            <h2 style="color: #d32f2f;">Suspicious QR Activity Detected</h2>
            <p><strong>Batch ID:</strong> ${batchId}</p>
            <p><strong>Alert Reason:</strong> ${reason}</p>
            <p><strong>Location:</strong> ${city || 'Unknown'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">This is an automated security alert from the HoneyChain KVIC Admin Center.</p>
          </div>
        `,
      });
      console.log('Security alert email sent to rehansuman41008@gmail.com');
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  }

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

      // Send email alert to Admin
      await this.sendSuspiciousAlertEmail(container.batchId.substring(0, 8), riskReason, locationData.city);
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
