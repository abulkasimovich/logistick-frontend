import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() { return this.customersService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.customersService.findOne(id); }

  @Post()
  @Roles('admin')
  create(@Body() body: any) { return this.customersService.create(body); }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.customersService.update(id, body); }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.customersService.remove(id); }
}
