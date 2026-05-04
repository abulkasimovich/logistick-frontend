import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { LoadsModule } from './loads/loads.module';
import { DriversModule } from './drivers/drivers.module';
import { DispatchersModule } from './dispatchers/dispatchers.module';
import { CustomersModule } from './customers/customers.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { NotificationsGateway } from './gateway/notifications.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'fleet_command',
      username: process.env.DB_USER || 'fleet_user',
      password: process.env.DB_PASSWORD || 'password',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // dev only
      logging: process.env.NODE_ENV === 'development',
    }),

    // Rate limiting: 100 req/min
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Feature modules
    AuthModule,
    LoadsModule,
    DriversModule,
    DispatchersModule,
    CustomersModule,
    StatsModule,
    UsersModule,
  ],
  providers: [NotificationsGateway],
})
export class AppModule {}
