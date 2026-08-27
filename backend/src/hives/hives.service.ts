import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HivesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.HiveUncheckedCreateInput, user: any) {
    if (user.role === 'BEEKEEPER') {
      const profile = await this.prisma.beekeeperProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new Error('Beekeeper profile not found');
      data.beekeeperId = profile.id;
    }
    return this.prisma.hive.create({ data });
  }

  findAll(user: any) {
    const where: any = {};
    if (user.role === 'BEEKEEPER') {
      where.beekeeper = { userId: user.id };
    }
    return this.prisma.hive.findMany({ where, include: { beekeeper: true } });
  }

  async findOne(id: string, user: any) {
    const hive = await this.prisma.hive.findUnique({ where: { id }, include: { beekeeper: true } });
    if (!hive) return null;
    if (user.role === 'BEEKEEPER' && hive.beekeeper.userId !== user.id) {
      throw new Error('Unauthorized');
    }
    return hive;
  }

  async update(id: string, data: Prisma.HiveUpdateInput, user: any) {
    const hive = await this.findOne(id, user); // check ownership
    if (!hive) throw new Error('Not found');
    return this.prisma.hive.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.hive.delete({ where: { id } });
  }
}
