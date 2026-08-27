import { Module } from '@nestjs/common';
import { HivesService } from './hives.service';
import { HivesController } from './hives.controller';

@Module({
  providers: [HivesService],
  controllers: [HivesController]
})
export class HivesModule {}
