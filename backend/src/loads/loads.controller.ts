import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LoadsService } from './loads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('loads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loads')
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['delivered', 'in_transit', 'booked', 'cancelled'] })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: any) {
    return this.loadsService.findAll({
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      status: query.status,
      search: query.search,
      driver_id: query.driver_id,
      customer_id: query.customer_id,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loadsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'dispatcher')
  create(@Body() body: any) {
    return this.loadsService.create(body);
  }

  @Put(':id')
  @Roles('admin', 'dispatcher')
  update(@Param('id') id: string, @Body() body: any) {
    return this.loadsService.update(id, body);
  }

  @Patch(':id/status')
  @Roles('admin', 'dispatcher', 'driver')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.loadsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.loadsService.remove(id);
  }
}
