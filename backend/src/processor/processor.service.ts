import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Valid transitions in the processor workflow
const VALID_TRANSITIONS: Record<string, string[]> = {
  HARVESTED:            ['ASSIGNED'],
  ASSIGNED:             ['ACCEPTED'],
  ACCEPTED:             ['PROCESSING'],
  PROCESSING:           ['PROCESSING_COMPLETED'],
  PROCESSING_COMPLETED: ['QUALITY_CHECKED'],
  QUALITY_CHECKED:      ['PACKAGED'],
  PACKAGED:             ['DISTRIBUTED'],
};

@Injectable()
export class ProcessorService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateProfile(user: any) {
    let profile = await this.prisma.processorProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await this.prisma.processorProfile.create({
        data: { userId: user.id, name: user.email.split('@')[0], facility: 'Main Facility' },
      });
    }
    return profile;
  }

  async getDashboard(user: any) {
    const profile = await this.getOrCreateProfile(user);
    const batches = await this.prisma.honeyBatch.findMany({
      where: { processorId: profile.id },
      include: { hive: true, beekeeper: true, containers: true, qualityRecords: true },
      orderBy: { updatedAt: 'desc' },
    });

    const available = await this.prisma.honeyBatch.count({ where: { status: 'HARVESTED', processorId: null } });

    return {
      processorId: profile.id,
      name: profile.name,
      facility: profile.facility,
      assigned: batches.filter(b => b.status === 'ASSIGNED' || b.status === 'ACCEPTED').length,
      inProgress: batches.filter(b => b.status === 'PROCESSING' || b.status === 'PROCESSING_COMPLETED').length,
      completed: batches.filter(b => ['QUALITY_CHECKED', 'PACKAGED', 'DISTRIBUTED'].includes(b.status)).length,
      availableBatches: available,
      batches,
    };
  }

  async getAvailableBatches() {
    return this.prisma.honeyBatch.findMany({
      where: { status: 'HARVESTED', processorId: null },
      include: { hive: true, beekeeper: true },
      orderBy: { harvestDate: 'desc' },
    });
  }

  async assignBatch(batchId: string, user: any) {
    const profile = await this.getOrCreateProfile(user);
    const batch = await this.prisma.honeyBatch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.status !== 'HARVESTED') throw new BadRequestException('Batch is not available for assignment');
    if (batch.processorId) throw new BadRequestException('Batch is already assigned');

    return this.prisma.honeyBatch.update({
      where: { id: batchId },
      data: { processorId: profile.id, status: 'ASSIGNED' },
    });
  }

  async transitionBatch(batchId: string, newStatus: string, user: any, notes?: string) {
    const profile = await this.getOrCreateProfile(user);
    const batch = await this.prisma.honeyBatch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.processorId !== profile.id) throw new ForbiddenException('You are not assigned to this batch');

    const allowed = VALID_TRANSITIONS[batch.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(`Invalid transition from ${batch.status} to ${newStatus}`);
    }

    // Create supply chain event
    await this.prisma.supplyChainEvent.create({
      data: {
        batchId,
        eventType: newStatus,
        description: notes || `Status transitioned to ${newStatus}`,
        userId: user.id,
      },
    });

    return this.prisma.honeyBatch.update({
      where: { id: batchId },
      data: { status: newStatus as any },
      include: { events: true, qualityRecords: true, hive: true },
    });
  }

  async addQualityRecord(batchId: string, metric: string, value: string, user: any) {
    const profile = await this.getOrCreateProfile(user);
    const batch = await this.prisma.honeyBatch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.processorId !== profile.id) throw new ForbiddenException('Not authorized');

    return this.prisma.qualityRecord.create({
      data: { batchId, metric, value },
    });
  }

  async createContainer(batchId: string, containerSize: number, user: any) {
    const profile = await this.getOrCreateProfile(user);
    const batch = await this.prisma.honeyBatch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.processorId !== profile.id) throw new ForbiddenException('Not authorized');

    const qrData = `${batchId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return this.prisma.batchContainer.create({
      data: { batchId, containerSize, qrData },
    });
  }
}
