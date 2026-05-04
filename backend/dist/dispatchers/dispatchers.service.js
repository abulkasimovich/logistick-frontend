"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dispatcher_entity_1 = require("./dispatcher.entity");
const load_entity_1 = require("../loads/load.entity");
let DispatchersService = class DispatchersService {
    constructor(dispRepo, loadRepo) {
        this.dispRepo = dispRepo;
        this.loadRepo = loadRepo;
    }
    async findAll() {
        const dispatchers = await this.dispRepo.find({ where: { is_active: true } });
        const stats = await this.loadRepo
            .createQueryBuilder('l')
            .select('l.dispatcher_id', 'dispatcher_id')
            .addSelect('COUNT(*)', 'total_loads')
            .addSelect('SUM(l.revenue)', 'total_revenue')
            .addSelect('SUM(l.revenue - l.fuel_cost - l.driver_pay)', 'total_profit')
            .groupBy('l.dispatcher_id')
            .getRawMany();
        const statsMap = new Map(stats.map(s => [s.dispatcher_id, s]));
        return dispatchers
            .map((d, i) => {
            const s = statsMap.get(d.id) || {};
            const revenue = parseFloat(s.total_revenue) || 0;
            const profit = parseFloat(s.total_profit) || 0;
            return {
                ...d, rank: i + 1,
                loads: parseInt(s.total_loads) || 0,
                revenue, profit,
                margin: revenue > 0 ? Math.round((profit / revenue) * 100) + '%' : '0%',
            };
        })
            .sort((a, b) => b.revenue - a.revenue)
            .map((d, i) => ({ ...d, rank: i + 1 }));
    }
    async findOne(id) {
        const d = await this.dispRepo.findOne({ where: { id } });
        if (!d)
            throw new common_1.NotFoundException('Dispatcher not found');
        return d;
    }
    async create(dto) {
        return this.dispRepo.save(this.dispRepo.create({ ...dto, is_active: true }));
    }
    async update(id, dto) {
        const d = await this.findOne(id);
        Object.assign(d, dto);
        return this.dispRepo.save(d);
    }
    async remove(id) {
        const d = await this.findOne(id);
        d.is_active = false;
        await this.dispRepo.save(d);
        return { message: 'Dispatcher deactivated', id };
    }
};
exports.DispatchersService = DispatchersService;
exports.DispatchersService = DispatchersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dispatcher_entity_1.Dispatcher)),
    __param(1, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DispatchersService);
//# sourceMappingURL=dispatchers.service.js.map