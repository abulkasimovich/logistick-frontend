import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Load } from './load.entity';

@Injectable()
export class LoadsService {
  constructor(
    @InjectRepository(Load)
    private readonly loadRepo: Repository<Load>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    driver_id?: string;
    customer_id?: string;
  }) {
    const { page = 1, limit = 20, status, search, driver_id, customer_id } = query;
    const skip = (page - 1) * limit;

    const qb = this.loadRepo.createQueryBuilder('l')
      .leftJoinAndSelect('l.driver', 'driver')
      .leftJoinAndSelect('l.customer', 'customer')
      .orderBy('l.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) qb.andWhere('l.status = :status', { status });
    if (search) qb.andWhere('l.load_number ILIKE :search', { search: `%${search}%` });
    if (driver_id) qb.andWhere('l.driver_id = :driver_id', { driver_id });
    if (customer_id) qb.andWhere('l.customer_id = :customer_id', { customer_id });

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const load = await this.loadRepo.findOne({
      where: { id },
      relations: ['driver', 'customer'],
    });
    if (!load) throw new NotFoundException('Load not found');
    return load;
  }

  async create(dto: Partial<Load>) {
    // Auto-generate load number
    const count = await this.loadRepo.count();
    const load = this.loadRepo.create({
      ...dto,
      load_number: `LD-${String(count + 1001).padStart(4, '0')}`,
    });
    return this.loadRepo.save(load);
  }

  async update(id: string, dto: Partial<Load>) {
    const load = await this.findOne(id);
    Object.assign(load, dto);
    return this.loadRepo.save(load);
  }

  async updateStatus(id: string, status: string) {
    const load = await this.findOne(id);
    load.status = status as any;
    if (status === 'delivered') load.delivered_at = new Date();
    const saved = await this.loadRepo.save(load);
    return { id: saved.id, status: saved.status, delivered_at: saved.delivered_at };
  }

  async remove(id: string) {
    const load = await this.findOne(id);
    await this.loadRepo.remove(load);
    return { message: 'Load deleted', id };
  }
}
