import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BeekeepersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: any) {
    const profile = await this.prisma.beekeeperProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          include: {
            cluster: true
          }
        },
        hives: true,
        batches: {
          include: {
            containers: {
              include: {
                scans: true
              }
            }
          }
        }
      }
    });

    if (!profile) return null;

    const activeHives = profile.hives.filter(h => h.status === 'ACTIVE').length;
    
    let totalHarvested = 0;
    let activeBatchesCount = 0;
    let alertCount = 0;
    const recentAlerts: any[] = [];

    for (const batch of profile.batches) {
      totalHarvested += batch.quantity;
      if (batch.status !== 'DISTRIBUTED') {
        activeBatchesCount++;
      }
      for (const container of batch.containers) {
        const suspiciousScans = container.scans.filter(s => s.isSuspicious);
        alertCount += suspiciousScans.length;
        suspiciousScans.forEach(scan => {
          recentAlerts.push({
            id: scan.id,
            qrData: container.qrData,
            batchId: batch.id.substring(0, 8),
            city: scan.city,
            timestamp: scan.timestamp
          });
        });
      }
    }

    // Sort alerts by newest first
    recentAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      name: profile.name,
      cluster: profile.user.cluster?.name || 'Unassigned Cluster',
      activeHives,
      totalHarvested,
      activeBatches: activeBatchesCount,
      alerts: alertCount,
      recentAlerts,
    };
  }
}
