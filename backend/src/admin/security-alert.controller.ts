import { Controller, Get, Patch, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SecurityAlertService } from './security-alert.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/security')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecurityAlertController {
  constructor(private readonly securityAlertService: SecurityAlertService) {}

  @Get('metrics')
  @Roles('ADMIN', 'KVIC')
  getMetrics() {
    return this.securityAlertService.getMetrics();
  }

  @Get('alerts')
  @Roles('ADMIN', 'KVIC')
  getAlerts(@Req() req: any) {
    return this.securityAlertService.getAlerts(req.user);
  }

  @Patch('alerts/:id')
  @Roles('ADMIN')
  updateAlertStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @Req() req: any,
  ) {
    return this.securityAlertService.updateAlertStatus(id, body.status, body.notes, req.user);
  }

  @Post('containers/:id/revoke')
  @Roles('ADMIN')
  revokeQR(@Param('id') id: string, @Req() req: any) {
    return this.securityAlertService.revokeQR(id, req.user);
  }
}
