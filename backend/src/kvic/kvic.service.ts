import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KvicService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [clusters, beekeepers, hives, batches, totalHoney, suspiciousScans, openAlerts] = await Promise.all([
      this.prisma.cluster.count(),
      this.prisma.beekeeperProfile.count(),
      this.prisma.hive.count(),
      this.prisma.honeyBatch.count(),
      this.prisma.honeyBatch.aggregate({ _sum: { quantity: true } }),
      this.prisma.qRScan.count({ where: { isSuspicious: true } }),
      (this.prisma as any).securityAlert.count({ where: { status: 'OPEN' } }),
    ]);
    return { clusters, beekeepers, hives, batches, totalHoneyKg: totalHoney._sum.quantity ?? 0, suspiciousScans, openAlerts };
  }

  async getClusters() {
    return this.prisma.cluster.findMany({
      include: { users: { include: { beekeeperProfile: { include: { hives: true, batches: true } } } } },
    });
  }

  async getBeekeepers() {
    return this.prisma.beekeeperProfile.findMany({
      include: { user: { include: { cluster: true } }, hives: true, batches: true },
    });
  }

  async getHives() {
    return this.prisma.hive.findMany({
      include: { beekeeper: { include: { user: true } }, batches: true },
    });
  }

  async getBatches() {
    return this.prisma.honeyBatch.findMany({
      include: { hive: true, beekeeper: { include: { user: true } }, containers: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getQrActivity() {
    const [totalScans, suspiciousScans, recentScans] = await Promise.all([
      this.prisma.qRScan.count(),
      this.prisma.qRScan.count({ where: { isSuspicious: true } }),
      this.prisma.qRScan.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: { container: { include: { batch: true } } },
      }),
    ]);
    return { totalScans, suspiciousScans, recentScans };
  }

  async getSecurityAlerts() {
    return (this.prisma as any).securityAlert.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      include: { container: { include: { batch: { include: { hive: true, beekeeper: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBeekeeper(data: any) {
    const cluster = await this.prisma.cluster.findFirst();
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password || 'password123',
        role: 'BEEKEEPER',
        clusterId: cluster?.id,
        beekeeperProfile: {
          create: {
            name: data.name,
            farmLocation: data.farmLocation,
            contact: data.contact,
          }
        }
      },
      include: { beekeeperProfile: true }
    });
  }
}
