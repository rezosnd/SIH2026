import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(user: any) {
    const totalHoneyAgg = await this.prisma.honeyBatch.aggregate({
      _sum: {
        quantity: true,
      },
    });
    const activeBatchesCount = await this.prisma.honeyBatch.count({
      where: {
        status: {
          not: 'DISTRIBUTED' // Everything else is active
        }
      }
    });
    const verifiedScansCount = await this.prisma.qRScan.count({
      where: {
        isSuspicious: false
      }
    });
    const suspiciousQrCount = await this.prisma.qRScan.count({
      where: {
        isSuspicious: true
      }
    });

    const recentAlerts = await this.prisma.notification.findMany({
      where: {
        type: 'QR_SUSPICIOUS_LOCATION', // Assuming this was the type
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    const totalHives = await this.prisma.hive.count();
    
    const twoMinsAgo = new Date(new Date().getTime() - 120000);
    const activeDevices = await this.prisma.ioTDevice.count({
      where: {
        lastSeenAt: {
          gte: twoMinsAgo
        }
      }
    });

    const openHiveAlerts = await this.prisma.hiveAlert.count({
      where: { status: 'OPEN' }
    });

    return {
      totalHoneyKg: totalHoneyAgg._sum.quantity || 0,
      activeBatches: activeBatchesCount,
      verifiedScans: verifiedScansCount,
      suspiciousQrs: suspiciousQrCount,
      recentAlerts,
      totalHives,
      activeDevices,
      openHiveAlerts
    };
  }
}
