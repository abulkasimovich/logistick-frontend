import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, is_active: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET || 'refresh_secret_key_min_32_chars',
      expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    });

    // Save refresh token hash
    user.refresh_token = await bcrypt.hash(refresh_token, 10);
    await this.userRepo.save(user);

    return {
      access_token,
      refresh_token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refresh_token) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!valid) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refresh_token: null });
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password_hash, refresh_token, ...result } = user;
    return result;
  }
}
