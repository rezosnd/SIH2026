import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { IoTService } from './iot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('iot')
export class IoTController {
  constructor(private readonly iotService: IoTService) {}

  // Admin/KVIC Register Device
  @Post('devices/register')
  async registerDevice(@Body() body: { deviceId: string, hiveId: string }) {
    return this.iotService.registerDevice(body.deviceId, body.hiveId);
  }

  // Ingestion Endpoint (mimicking MQTT broker payload for REST-based ESP32 fallback)
  @Post('hives/:hiveId/telemetry')
  async ingestTelemetry(@Param('hiveId') hiveId: string, @Body() payload: any) {
    return this.iotService.ingestTelemetry(hiveId, payload);
  }

  @Get('hives/:hiveId')
  @UseGuards(JwtAuthGuard)
  async getHiveIoTDetails(@Param('hiveId') hiveId: string, @Req() req: any) {
    return this.iotService.getHiveDetails(hiveId, req.user);
  }

  @Get('hives/:hiveId/analysis')
  @UseGuards(JwtAuthGuard)
  async getHiveAnalysis(@Param('hiveId') hiveId: string, @Req() req: any, @Query('lang') lang?: string) {
    return this.iotService.getHiveAnalysis(hiveId, req.user, lang || 'English');
  }

  @Get('hives/:hiveId/history')
  @UseGuards(JwtAuthGuard)
  async getHiveHistory(
    @Param('hiveId') hiveId: string,
    @Query('range') range: string, // 24H, 7D, 30D
    @Req() req: any,
  ) {
    return this.iotService.getHiveHistory(hiveId, range, req.user);
  }
}
