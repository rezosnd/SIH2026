import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { BeekeepersService } from './beekeepers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('beekeepers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BeekeepersController {
  constructor(private readonly beekeepersService: BeekeepersService) {}

  @Get('dashboard')
  @Roles('BEEKEEPER', 'ADMIN')
  async getDashboard(@Req() req: any) {
    return this.beekeepersService.getDashboard(req.user);
  }
}
