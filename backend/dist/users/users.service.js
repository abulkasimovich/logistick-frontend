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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./user.entity");
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async findAll() {
        const users = await this.userRepo.find({ order: { created_at: 'DESC' } });
        return users.map(({ password_hash, refresh_token, ...u }) => u);
    }
    async create(dto) {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already exists');
        const password_hash = await bcrypt.hash(dto.password, 12);
        const user = this.userRepo.create({
            email: dto.email,
            name: dto.name,
            role: dto.role,
            password_hash,
            is_active: true,
        });
        const saved = await this.userRepo.save(user);
        const { password_hash: _ph, refresh_token: _rt, ...result } = saved;
        return result;
    }
    async updateRole(id, role) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.role = role;
        await this.userRepo.save(user);
        return { message: 'Role updated', id, role };
    }
    async deactivate(id) {
        await this.userRepo.update(id, { is_active: false });
        return { message: 'User deactivated' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map