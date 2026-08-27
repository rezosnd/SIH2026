import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, clusterId: true, createdAt: true },
    });
  }

  findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findOrCreateGoogleUser(email: string, firstName: string, lastName: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For Google users, we generate a random complex password 
      // since they won't login via email/password directly right now
      const randomPassword = (Math.random() + 1).toString(36).substring(2) + (Math.random() + 1).toString(36).substring(2);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'BEEKEEPER', // default role
        },
      });
      // Optionally create BeekeeperProfile if we assume they are a beekeeper
      await this.prisma.beekeeperProfile.create({
        data: {
          userId: user.id,
          name: `${firstName} ${lastName}`,
          farmLocation: 'Unknown',
        }
      });
    }
    return user;
  }
}
