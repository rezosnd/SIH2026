import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HivesModule } from './hives/hives.module';
import { BatchesModule } from './batches/batches.module';
import { QrModule } from './qr/qr.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AdminModule } from './admin/admin.module';
import { BeekeepersModule } from './beekeepers/beekeepers.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, HivesModule, BatchesModule, QrModule, BlockchainModule, AdminModule, BeekeepersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
