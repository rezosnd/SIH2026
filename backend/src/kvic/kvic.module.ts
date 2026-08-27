import { Module } from '@nestjs/common';
import { KvicController } from './kvic.controller';
import { KvicService } from './kvic.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KvicController],
  providers: [KvicService],
})
export class KvicModule {}
