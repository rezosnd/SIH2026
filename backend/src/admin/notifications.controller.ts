import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('ADMIN', 'KVIC', 'BEEKEEPER', 'PROCESSOR')
  async getAll(@Req() req: any) {
    // Admins/KVIC see global notifications; others see only theirs
    const where = ['ADMIN', 'KVIC'].includes(req.user.role)
      ? {}
      : { userId: req.user.id };
    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Patch(':id/read')
  @Roles('ADMIN', 'KVIC', 'BEEKEEPER', 'PROCESSOR')
  async markRead(@Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
