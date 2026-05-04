// dispatchers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispatcher } from './dispatcher.entity';
import { Load } from '../loads/load.entity';
import { DispatchersController } from './dispatchers.controller';
import { DispatchersService } from './dispatchers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dispatcher, Load])],
  controllers: [DispatchersController],
  providers: [DispatchersService],
})
export class DispatchersModule {}
