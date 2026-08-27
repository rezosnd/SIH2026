import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { Prisma } from '@prisma/client';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  create(@Body() createBatchDto: Prisma.HoneyBatchUncheckedCreateInput) {
    return this.batchesService.create(createBatchDto);
  }

  @Get()
  findAll() {
    return this.batchesService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBatchDto: Prisma.HoneyBatchUpdateInput) {
    return this.batchesService.update(id, updateBatchDto);
  }
}
