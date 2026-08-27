import { Module } from '@nestjs/common';
import { BeekeepersController } from './beekeepers.controller';
import { BeekeepersService } from './beekeepers.service';

@Module({
  controllers: [BeekeepersController],
  providers: [BeekeepersService]
})
export class BeekeepersModule {}
