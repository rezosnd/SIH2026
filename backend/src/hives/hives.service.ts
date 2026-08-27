import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HivesService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.HiveUncheckedCreateInput) {
    return this.prisma.hive.create({ data });
  }

  findAll() {
    return this.prisma.hive.findMany({ include: { beekeeper: true } });
  }

  findOne(id: string) {
    return this.prisma.hive.findUnique({ where: { id }, include: { batches: true } });
  }

  update(id: string, data: Prisma.HiveUpdateInput) {
    return this.prisma.hive.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.hive.delete({ where: { id } });
  }
}
