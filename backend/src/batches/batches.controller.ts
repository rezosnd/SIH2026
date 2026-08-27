import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  verifyQR(@Param('qrData') qrData: string) {
    return this.batchesService.verifyQR(qrData);
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
