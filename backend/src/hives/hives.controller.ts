import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HivesService } from './hives.service';
import { Prisma } from '@prisma/client';

@Controller('hives')
export class HivesController {
  constructor(private readonly hivesService: HivesService) {}

  @Post()
  create(@Body() createHiveDto: Prisma.HiveUncheckedCreateInput) {
    return this.hivesService.create(createHiveDto);
  }

  @Get()
  findAll() {
    return this.hivesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hivesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHiveDto: Prisma.HiveUpdateInput) {
    return this.hivesService.update(id, updateHiveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hivesService.remove(id);
  }
}
