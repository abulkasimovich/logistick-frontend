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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const load_entity_1 = require("../loads/load.entity");
let CustomersService = class CustomersService {
    constructor(custRepo, loadRepo) {
        this.custRepo = custRepo;
        this.loadRepo = loadRepo;
    }
    async findAll() {
        const customers = await this.custRepo.find({ where: { is_active: true } });
        const stats = await this.loadRepo
            .createQueryBuilder('l')
            .select('l.customer_id', 'customer_id')
            .addSelect('COUNT(*)', 'total_loads')
            .addSelect('SUM(l.revenue)', 'total_revenue')
            .groupBy('l.customer_id')
            .getRawMany();
        const statsMap = new Map(stats.map(s => [s.customer_id, s]));
        const totalRevAll = stats.reduce((s, x) => s + parseFloat(x.total_revenue || '0'), 0);
        return customers
            .map(c => {
            const s = statsMap.get(c.id) || {};
            const revenue = parseFloat(s.total_revenue) || 0;
            const loads = parseInt(s.total_loads) || 0;
            return { ...c, loads, revenue, revenue_share: totalRevAll > 0 ? ((revenue / totalRevAll) * 100).toFixed(1) + '%' : '0%' };
        })
            .sort((a, b) => b.revenue - a.revenue);
    }
    async findOne(id) {
        const c = await this.custRepo.findOne({ where: { id } });
        if (!c)
            throw new common_1.NotFoundException('Customer not found');
        return c;
    }
    async create(dto) {
        const c = this.custRepo.create(dto);
        return this.custRepo.save(c);
    }
    async update(id, dto) {
        const c = await this.findOne(id);
        Object.assign(c, dto);
        return this.custRepo.save(c);
    }
    async remove(id) {
        await this.custRepo.update(id, { is_active: false });
        return { message: 'Customer deactivated', id };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map