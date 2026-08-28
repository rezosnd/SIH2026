import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any) {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  @Get('hives')
  @UseGuards(JwtAuthGuard)
  async getAllHives() {
    const hives = await this.prisma.hive.findMany({
      include: {
        device: true
      }
    });
    
    return hives.map(h => {
      const isOnline = h.device?.lastSeenAt && (new Date().getTime() - h.device.lastSeenAt.getTime() < 2592000000);
      return {
        id: h.id,
        location: h.location,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        device: h.device
      };
    });
  }
}
