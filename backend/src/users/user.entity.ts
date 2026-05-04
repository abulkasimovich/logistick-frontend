import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ type: 'enum', enum: ['admin', 'dispatcher', 'analyst', 'driver'], default: 'dispatcher' })
  role: 'admin' | 'dispatcher' | 'analyst' | 'driver';

  @Column({ nullable: true, type: 'text' })
  refresh_token: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
