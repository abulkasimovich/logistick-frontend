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
exports.LoadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const load_entity_1 = require("./load.entity");
let LoadsService = class LoadsService {
    constructor(loadRepo) {
        this.loadRepo = loadRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 20, status, search, driver_id, customer_id } = query;
        const skip = (page - 1) * limit;
        const qb = this.loadRepo.createQueryBuilder('l')
            .leftJoinAndSelect('l.driver', 'driver')
            .leftJoinAndSelect('l.customer', 'customer')
            .orderBy('l.created_at', 'DESC')
            .skip(skip)
            .take(limit);
        if (status)
            qb.andWhere('l.status = :status', { status });
        if (search)
            qb.andWhere('l.load_number ILIKE :search', { search: `%${search}%` });
        if (driver_id)
            qb.andWhere('l.driver_id = :driver_id', { driver_id });
        if (customer_id)
            qb.andWhere('l.customer_id = :customer_id', { customer_id });
        const [data, total] = await qb.getManyAndCount();
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const load = await this.loadRepo.findOne({
            where: { id },
            relations: ['driver', 'customer'],
        });
        if (!load)
            throw new common_1.NotFoundException('Load not found');
        return load;
    }
    async create(dto) {
        const count = await this.loadRepo.count();
        const load = this.loadRepo.create({
            ...dto,
            load_number: `LD-${String(count + 1001).padStart(4, '0')}`,
        });
        return this.loadRepo.save(load);
    }
    async update(id, dto) {
        const load = await this.findOne(id);
        Object.assign(load, dto);
        return this.loadRepo.save(load);
    }
    async updateStatus(id, status) {
        const load = await this.findOne(id);
        load.status = status;
        if (status === 'delivered')
            load.delivered_at = new Date();
        const saved = await this.loadRepo.save(load);
        return { id: saved.id, status: saved.status, delivered_at: saved.delivered_at };
    }
    async remove(id) {
        const load = await this.findOne(id);
        await this.loadRepo.remove(load);
        return { message: 'Load deleted', id };
    }
};
exports.LoadsService = LoadsService;
exports.LoadsService = LoadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LoadsService);
//# sourceMappingURL=loads.service.js.map