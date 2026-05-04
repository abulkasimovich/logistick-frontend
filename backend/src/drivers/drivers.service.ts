import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import { Load } from '../loads/load.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Load)
    private readonly loadRepo: Repository<Load>,
  ) {}

  async findAll(sort = 'revenue', order = 'desc') {
    // Get all drivers with aggregated stats from loads
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

    // Sort
    result.sort((a, b) => {
      const aVal = a[sort] || 0;
      const bVal = b[sort] || 0;
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return result.map((d, i) => ({ ...d, rank: i + 1 }));
  }

  async findOne(id: string) {
    const driver = await this.driverRepo.findOne({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async create(dto: Partial<Driver>) {
    const driver = this.driverRepo.create(dto);
    return this.driverRepo.save(driver);
  }

  async update(id: string, dto: Partial<Driver>) {
    const driver = await this.findOne(id);
    Object.assign(driver, dto);
    return this.driverRepo.save(driver);
  }

  async remove(id: string) {
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
        return sq.select('l2.driver_id').addSelect('COUNT(*)', 'loads').from(Load, 'l2').groupBy('l2.driver_id');
      }, 'counts')
      .getRawOne();

    return {
      active,
      on_trip: onTrip,
      total: active + onTrip,
      avg_loads_per_driver: parseFloat(stats?.avg_loads) || 0,
    };
  }
}
