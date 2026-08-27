import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HivesService } from './hives.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('hives')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HivesController {
  constructor(private readonly hivesService: HivesService) {}

  @Post()
  @Roles('BEEKEEPER', 'ADMIN')
  create(@Body() createHiveDto: Prisma.HiveUncheckedCreateInput, @Req() req: any) {
    return this.hivesService.create(createHiveDto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.hivesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.hivesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('BEEKEEPER', 'ADMIN')
  update(@Param('id') id: string, @Body() updateHiveDto: Prisma.HiveUpdateInput, @Req() req: any) {
    return this.hivesService.update(id, updateHiveDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN') // Only admins can delete hives, beekeepers can only archive them ideally
  remove(@Param('id') id: string) {
    return this.hivesService.remove(id);
  }
}
