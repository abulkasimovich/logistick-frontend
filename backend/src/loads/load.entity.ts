import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index
} from 'typeorm';
import { Driver } from '../drivers/driver.entity';
import { Customer } from '../customers/customer.entity';

@Entity('loads')
export class Load {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  @Index()
  load_number: string;

  @Column({ type: 'enum', enum: ['delivered', 'in_transit', 'booked', 'cancelled'], default: 'booked' })
  @Index()
  status: 'delivered' | 'in_transit' | 'booked' | 'cancelled';

  @Column({ length: 100 })
  origin: string;

  @Column({ length: 100 })
  destination: string;

  @Column({ length: 50 })
  truck_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  miles: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fuel_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  driver_pay: number;

  @Column({ nullable: true })
  driver_id: string;

  @ManyToOne(() => Driver, { nullable: true, eager: false })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ nullable: true })
  customer_id: string;

  @ManyToOne(() => Customer, { nullable: true, eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ nullable: true })
  dispatcher_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  delivered_at: Date;
}
