import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DispatchersService } from './dispatchers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('dispatchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dispatchers')
export class DispatchersController {
  constructor(private readonly dispatchersService: DispatchersService) {}

  @Get()
  findAll() { return this.dispatchersService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.dispatchersService.findOne(id); }

  @Post()
  @Roles('admin')
  create(@Body() body: any) { return this.dispatchersService.create(body); }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.dispatchersService.update(id, body); }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.dispatchersService.remove(id); }
}
