import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Load } from './load.entity';
import { LoadsController } from './loads.controller';
import { LoadsService } from './loads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Load])],
  controllers: [LoadsController],
  providers: [LoadsService],
  exports: [LoadsService, TypeOrmModule],
})
export class LoadsModule {}
