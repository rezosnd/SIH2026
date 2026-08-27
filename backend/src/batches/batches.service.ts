import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class BatchesService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService
  ) {}

  async create(data: Prisma.HoneyBatchUncheckedCreateInput) {
    const qrData = crypto.randomUUID();
    const batch = await this.prisma.honeyBatch.create({
      data: { ...data, qrData },
      include: { hive: true }
    });
    
    // Auto-record to blockchain
    const location = batch.hive?.location || 'Unknown Origin';
    this.blockchain.recordBatchCreated(batch.id, location);
    
    return batch;
  }

  findAll() {
    return this.prisma.honeyBatch.findMany({
      include: { hive: true, containers: true },
    });
  }

  findOne(id: string) {
    return this.prisma.honeyBatch.findUnique({
      where: { id },
      include: { hive: true, events: true, qualityRecords: true, containers: true },
    });
  }

  update(id: string, data: Prisma.HoneyBatchUpdateInput) {
    return this.prisma.honeyBatch.update({ where: { id }, data });
  }

  async verifyQR(qrData: string) {
    // First try to find if this QR belongs directly to a Batch (e.g. bulk QR)
    let batch = await this.prisma.honeyBatch.findUnique({
      where: { qrData },
      include: { events: true, qualityRecords: true, hive: { include: { beekeeper: true } } },
    });

    // If not found, it might be a container (individual jar) QR
    if (!batch) {
      const container = await this.prisma.batchContainer.findUnique({
        where: { qrData },
        include: {
          batch: {
            include: { events: true, qualityRecords: true, hive: { include: { beekeeper: true } } }
          }
        }
      });
      if (container) {
        batch = container.batch;
      }
    }
    
    return batch;
  }
}
