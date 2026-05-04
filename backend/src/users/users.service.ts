import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

type UserRole = 'admin' | 'dispatcher' | 'analyst' | 'driver';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepo.find({ order: { created_at: 'DESC' } });
    return users.map(({ password_hash, refresh_token, ...u }) => u);
  }

  async create(dto: { email: string; name: string; password: string; role: string }) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
      role: dto.role as UserRole,
      password_hash,
      is_active: true,
    });

    const saved: User = await this.userRepo.save(user);
    const { password_hash: _ph, refresh_token: _rt, ...result } = saved;
    return result;
  }

  async updateRole(id: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role as UserRole;
    await this.userRepo.save(user);
    return { message: 'Role updated', id, role };
  }

  async deactivate(id: string) {
    await this.userRepo.update(id, { is_active: false });
    return { message: 'User deactivated' };
  }
}
