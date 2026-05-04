import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Load } from '../loads/load.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly custRepo: Repository<Customer>,
    @InjectRepository(Load) private readonly loadRepo: Repository<Load>,
  ) {}

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

  async findOne(id: string) {
    const c = await this.custRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async create(dto: Partial<Customer>) {
    const c = this.custRepo.create(dto);
    return this.custRepo.save(c);
  }

  async update(id: string, dto: Partial<Customer>) {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.custRepo.save(c);
  }

  async remove(id: string) {
    await this.custRepo.update(id, { is_active: false });
    return { message: 'Customer deactivated', id };
  }
}
