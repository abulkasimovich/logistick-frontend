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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("./driver.entity");
const load_entity_1 = require("../loads/load.entity");
let DriversService = class DriversService {
    constructor(driverRepo, loadRepo) {
        this.driverRepo = driverRepo;
        this.loadRepo = loadRepo;
    }
    async findAll(sort = 'revenue', order = 'desc') {
        const drivers = await this.driverRepo.find();
        const stats = await this.loadRepo
            .createQueryBuilder('l')
            .select('l.driver_id', 'driver_id')
            .addSelect('COUNT(*)', 'total_loads')
            .addSelect('SUM(l.revenue)', 'total_revenue')
            .addSelect('SUM(l.miles)', 'total_miles')
            .addSelect('SUM(l.fuel_cost)', 'total_fuel')
            .addSelect('SUM(l.driver_pay)', 'total_driver_pay')
            .groupBy('l.driver_id')
            .getRawMany();
        const statsMap = new Map(stats.map(s => [s.driver_id, s]));
        const result = drivers.map(d => {
            const s = statsMap.get(d.id) || {};
            const revenue = parseFloat(s.total_revenue) || 0;
            const miles = parseFloat(s.total_miles) || 0;
            return {
                ...d,
                loads: parseInt(s.total_loads) || 0,
                revenue,
                miles,
                fuel: parseFloat(s.total_fuel) || 0,
                driver_pay: parseFloat(s.total_driver_pay) || 0,
                rpm: miles > 0 ? `$${(revenue / miles).toFixed(2)}` : '$0.00',
            };
        });
        result.sort((a, b) => {
            const aVal = a[sort] || 0;
            const bVal = b[sort] || 0;
            return order === 'desc' ? bVal - aVal : aVal - bVal;
        });
        return result.map((d, i) => ({ ...d, rank: i + 1 }));
    }
    async findOne(id) {
        const driver = await this.driverRepo.findOne({ where: { id } });
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        return driver;
    }
    async create(dto) {
        const driver = this.driverRepo.create(dto);
        return this.driverRepo.save(driver);
    }
    async update(id, dto) {
        const driver = await this.findOne(id);
        Object.assign(driver, dto);
        return this.driverRepo.save(driver);
    }
    async remove(id) {
        const driver = await this.findOne(id);
        await this.driverRepo.remove(driver);
        return { message: 'Driver deleted' };
    }
    async getMetrics() {
        const active = await this.driverRepo.count({ where: { status: 'active' } });
        const onTrip = await this.driverRepo.count({ where: { status: 'on_trip' } });
        const stats = await this.loadRepo
            .createQueryBuilder('l')
            .select('COUNT(DISTINCT l.driver_id)', 'driver_count')
            .addSelect('AVG(counts.loads)', 'avg_loads')
            .from(sq => {
            return sq.select('l2.driver_id').addSelect('COUNT(*)', 'loads').from(load_entity_1.Load, 'l2').groupBy('l2.driver_id');
        }, 'counts')
            .getRawOne();
        return {
            active,
            on_trip: onTrip,
            total: active + onTrip,
            avg_loads_per_driver: parseFloat(stats?.avg_loads) || 0,
        };
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __param(1, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DriversService);
//# sourceMappingURL=drivers.service.js.map