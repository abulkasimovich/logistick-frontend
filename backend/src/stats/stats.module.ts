// stats.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Load } from '../loads/load.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Load])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
