import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('processor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROCESSOR', 'ADMIN')
export class ProcessorController {
  constructor(private readonly processorService: ProcessorService) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.processorService.getDashboard(req.user);
  }

  @Get('batches/available')
  getAvailableBatches() {
    return this.processorService.getAvailableBatches();
  }

  @Post('batches/:id/assign')
  assignBatch(@Param('id') id: string, @Req() req: any) {
    return this.processorService.assignBatch(id, req.user);
  }

  @Patch('batches/:id/transition')
  transitionBatch(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @Req() req: any,
  ) {
    return this.processorService.transitionBatch(id, body.status, req.user, body.notes);
  }

  @Post('batches/:id/quality')
  addQualityRecord(
    @Param('id') id: string,
    @Body() body: { metric: string; value: string },
    @Req() req: any,
  ) {
    return this.processorService.addQualityRecord(id, body.metric, body.value, req.user);
  }

  @Post('batches/:id/containers')
  createContainer(
    @Param('id') id: string,
    @Body() body: { containerSize: number },
    @Req() req: any,
  ) {
    return this.processorService.createContainer(id, body.containerSize, req.user);
  }
}
