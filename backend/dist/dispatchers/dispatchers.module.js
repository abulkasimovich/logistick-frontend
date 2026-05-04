"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dispatcher_entity_1 = require("./dispatcher.entity");
const load_entity_1 = require("../loads/load.entity");
const dispatchers_controller_1 = require("./dispatchers.controller");
const dispatchers_service_1 = require("./dispatchers.service");
let DispatchersModule = class DispatchersModule {
};
exports.DispatchersModule = DispatchersModule;
exports.DispatchersModule = DispatchersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([dispatcher_entity_1.Dispatcher, load_entity_1.Load])],
        controllers: [dispatchers_controller_1.DispatchersController],
        providers: [dispatchers_service_1.DispatchersService],
    })
], DispatchersModule);
//# sourceMappingURL=dispatchers.module.js.map