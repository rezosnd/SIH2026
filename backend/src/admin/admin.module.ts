import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SecurityAlertController } from './security-alert.controller';
import { SecurityAlertService } from './security-alert.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, SecurityAlertController, NotificationsController],
  providers: [AdminService, SecurityAlertService],
  exports: [SecurityAlertService],
})
export class AdminModule {}

