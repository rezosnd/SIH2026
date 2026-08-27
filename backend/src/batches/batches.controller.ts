import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BEEKEEPER', 'ADMIN')
  create(@Body() createBatchDto: Prisma.HoneyBatchUncheckedCreateInput, @Req() req: any) {
    return this.batchesService.create(createBatchDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.batchesService.findAll(req.user);
  }

  @Get('verify/:qrData')
  async verifyQR(@Param('qrData') qrData: string) {
    const batch = await this.batchesService.verifyQR(qrData);
    if (!batch) {
      throw new NotFoundException('QR Code not found');
    }
    return batch;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.batchesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BEEKEEPER', 'ADMIN', 'PROCESSOR')
  update(@Param('id') id: string, @Body() updateBatchDto: Prisma.HoneyBatchUpdateInput, @Req() req: any) {
    return this.batchesService.update(id, updateBatchDto, req.user);
  }
}
