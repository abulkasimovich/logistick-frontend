import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('dispatchers')
export class Dispatcher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, default: 'Team Alpha' })
  team: string;

  @Column({ length: 50, default: 'Southeast' })
  region: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
