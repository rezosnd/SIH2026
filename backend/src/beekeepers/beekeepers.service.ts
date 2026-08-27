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

    for (const batch of profile.batches) {
      totalHarvested += batch.quantity;
      if (batch.status !== 'DISTRIBUTED') {
        activeBatchesCount++;
      }
      for (const container of batch.containers) {
        alertCount += container.scans.filter(s => s.isSuspicious).length;
      }
    }

    return {
      name: profile.name,
      cluster: profile.user.cluster?.name || 'Unassigned Cluster',
      activeHives,
      totalHarvested,
      activeBatches: activeBatchesCount,
      alerts: alertCount,
    };
  }
}
