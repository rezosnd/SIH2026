import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityAlertService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlerts(user: any) {
    const where: any = {};
    if (user.role === 'KVIC') {
      // KVIC sees all open/under review alerts but cannot resolve
      where.status = { in: ['OPEN', 'UNDER_REVIEW'] };
    }
    return this.prisma.securityAlert.findMany({
      where,
      include: {
        container: {
          include: { batch: { include: { hive: true, beekeeper: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMetrics() {
    const [total, open, underReview, resolved, falsePositive] = await Promise.all([
      this.prisma.securityAlert.count(),
      this.prisma.securityAlert.count({ where: { status: 'OPEN' } }),
      this.prisma.securityAlert.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.securityAlert.count({ where: { status: 'RESOLVED' } }),
      this.prisma.securityAlert.count({ where: { status: 'FALSE_POSITIVE' } }),
    ]);
    const totalQr = await this.prisma.batchContainer.count();
    const revokedQr = await this.prisma.batchContainer.count({ where: { revokedAt: { not: null } } });
    const totalScans = await this.prisma.qRScan.count();
    return { total, open, underReview, resolved, falsePositive, totalQr, revokedQr, totalScans };
  }

  async updateAlertStatus(alertId: string, status: string, notes: string | undefined, user: any) {
    if (user.role === 'KVIC') throw new ForbiddenException('KVIC cannot resolve alerts');

    const alert = await this.prisma.securityAlert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Alert not found');

    const updated = await this.prisma.securityAlert.update({
      where: { id: alertId },
      data: {
        status: status as any,
        resolvedById: status === 'RESOLVED' || status === 'FALSE_POSITIVE' ? user.id : undefined,
        resolvedAt: status === 'RESOLVED' || status === 'FALSE_POSITIVE' ? new Date() : undefined,
        investigationNotes: notes,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `ALERT_${status}`,
        resource: alertId,
        metadata: JSON.stringify({ notes }),
      },
    });

    return updated;
  }

  async revokeQR(containerId: string, user: any) {
    if (!['ADMIN'].includes(user.role)) throw new ForbiddenException('Only admins can revoke QR codes');

    const container = await this.prisma.batchContainer.findUnique({ where: { id: containerId } });
    if (!container) throw new NotFoundException('Container not found');

    await this.prisma.batchContainer.update({
      where: { id: containerId },
      data: { revokedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'QR_REVOKED',
        resource: containerId,
      },
    });

    return { success: true, message: 'QR code revoked' };
  }
}
