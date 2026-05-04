import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  findAll(@Query('sort') sort = 'revenue', @Query('order') order = 'desc') {
    return this.driversService.findAll(sort, order);
  }

  @Get('metrics')
  getMetrics() {
    return this.driversService.getMetrics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: any) {
    return this.driversService.create(body);
  }

  @Put(':id')
  @Roles('admin', 'dispatcher')
  update(@Param('id') id: string, @Body() body: any) {
    return this.driversService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
