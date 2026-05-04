import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  truck_type: string;

  @Column({ length: 100 })
  terminal: string;

  @Column({ type: 'enum', enum: ['active', 'on_trip', 'rest', 'inactive'], default: 'active' })
  status: 'active' | 'on_trip' | 'rest' | 'inactive';

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  license_number: string;

  @CreateDateColumn()
  created_at: Date;
}
