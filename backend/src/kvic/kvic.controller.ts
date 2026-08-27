import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { KvicService } from './kvic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('kvic')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('KVIC', 'ADMIN')
export class KvicController {
  constructor(private readonly kvicService: KvicService) {}

  @Get('dashboard')
  getDashboard() { return this.kvicService.getDashboard(); }

  @Get('clusters')
  getClusters() { return this.kvicService.getClusters(); }

  @Get('beekeepers')
  getBeekeepers() { return this.kvicService.getBeekeepers(); }

  @Get('hives')
  getHives() { return this.kvicService.getHives(); }

  @Get('batches')
  getBatches() { return this.kvicService.getBatches(); }

  @Get('qr-activity')
  getQrActivity() { return this.kvicService.getQrActivity(); }

  @Get('security-alerts')
  getSecurityAlerts() { return this.kvicService.getSecurityAlerts(); }

  @Post('beekeepers')
  createBeekeeper(@Body() body: any) {
    return this.kvicService.createBeekeeper(body);
  }
}
