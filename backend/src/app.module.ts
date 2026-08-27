import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { ProcessorModule } from './processor/processor.module';
import { KvicModule } from './kvic/kvic.module';
import { IoTModule } from './iot/iot.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute by default
    }]),
    PrismaModule, AuthModule, UsersModule, HivesModule, BatchesModule, QrModule, BlockchainModule, AdminModule, BeekeepersModule, ProcessorModule, KvicModule, IoTModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
