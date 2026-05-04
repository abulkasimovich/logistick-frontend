import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiQuery({ name: 'period', required: false, enum: ['3M', '6M', '12M'] })
  getOverview(@Query('period') period = '12M') {
    return this.statsService.getOverview(period);
  }

  @Get('monthly')
  @ApiQuery({ name: 'period', required: false })
  getMonthly(@Query('period') period = '12M') {
    return this.statsService.getMonthly(period);
  }

  @Get('financials')
  @ApiQuery({ name: 'period', required: false })
  getFinancials(@Query('period') period = '12M') {
    return this.statsService.getFinancials(period);
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
