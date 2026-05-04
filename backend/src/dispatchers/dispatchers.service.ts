import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispatcher } from './dispatcher.entity';
import { Load } from '../loads/load.entity';

@Injectable()
export class DispatchersService {
  constructor(
    @InjectRepository(Dispatcher) private readonly dispRepo: Repository<Dispatcher>,
    @InjectRepository(Load)       private readonly loadRepo: Repository<Load>,
  ) {}

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
        const profit  = parseFloat(s.total_profit)  || 0;
        return {
          ...d, rank: i + 1,
          loads:  parseInt(s.total_loads) || 0,
          revenue, profit,
          margin: revenue > 0 ? Math.round((profit / revenue) * 100) + '%' : '0%',
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .map((d, i) => ({ ...d, rank: i + 1 }));
  }

  async findOne(id: string) {
    const d = await this.dispRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Dispatcher not found');
    return d;
  }

  async create(dto: Partial<Dispatcher>) {
    return this.dispRepo.save(this.dispRepo.create({ ...dto, is_active: true }));
  }

  async update(id: string, dto: Partial<Dispatcher>) {
    const d = await this.findOne(id);
    Object.assign(d, dto);
    return this.dispRepo.save(d);
  }

  async remove(id: string) {
    const d = await this.findOne(id);
    d.is_active = false;
    await this.dispRepo.save(d);
    return { message: 'Dispatcher deactivated', id };
  }
}
