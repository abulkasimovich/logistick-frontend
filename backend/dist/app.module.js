"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const loads_module_1 = require("./loads/loads.module");
const drivers_module_1 = require("./drivers/drivers.module");
const dispatchers_module_1 = require("./dispatchers/dispatchers.module");
const customers_module_1 = require("./customers/customers.module");
const stats_module_1 = require("./stats/stats.module");
const users_module_1 = require("./users/users.module");
const notifications_gateway_1 = require("./gateway/notifications.gateway");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 5432,
                database: process.env.DB_NAME || 'fleet_command',
                username: process.env.DB_USER || 'fleet_user',
                password: process.env.DB_PASSWORD || 'password',
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            auth_module_1.AuthModule,
            loads_module_1.LoadsModule,
            drivers_module_1.DriversModule,
            dispatchers_module_1.DispatchersModule,
            customers_module_1.CustomersModule,
            stats_module_1.StatsModule,
            users_module_1.UsersModule,
        ],
        providers: [notifications_gateway_1.NotificationsGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map