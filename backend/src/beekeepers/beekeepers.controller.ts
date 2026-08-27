import { Controller, Get } from '@nestjs/common';
import { BeekeepersService } from './beekeepers.service';

@Controller('beekeepers')
export class BeekeepersController {
  constructor(private readonly beekeepersService: BeekeepersService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.beekeepersService.getDashboard();
  }
}
