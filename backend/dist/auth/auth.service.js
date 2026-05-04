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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/user.entity");
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email, is_active: true } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload);
        const refresh_token = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_SECRET || 'refresh_secret_key_min_32_chars',
            expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
        });
        user.refresh_token = await bcrypt.hash(refresh_token, 10);
        await this.userRepo.save(user);
        return {
            access_token,
            refresh_token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        };
    }
    async refresh(userId, refreshToken) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.refresh_token)
            throw new common_1.UnauthorizedException();
        const valid = await bcrypt.compare(refreshToken, user.refresh_token);
        if (!valid)
            throw new common_1.UnauthorizedException();
        const payload = { sub: user.id, email: user.email, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }
    async logout(userId) {
        await this.userRepo.update(userId, { refresh_token: null });
        return { message: 'Logged out successfully' };
    }
    async getMe(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const { password_hash, refresh_token, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map