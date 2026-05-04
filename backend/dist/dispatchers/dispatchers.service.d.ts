import { Repository } from 'typeorm';
import { Dispatcher } from './dispatcher.entity';
import { Load } from '../loads/load.entity';
export declare class DispatchersService {
    private readonly dispRepo;
    private readonly loadRepo;
    constructor(dispRepo: Repository<Dispatcher>, loadRepo: Repository<Load>);
    findAll(): Promise<{
        rank: number;
        loads: number;
        revenue: number;
        profit: number;
        margin: string;
        id: string;
        name: string;
        team: string;
        region: string;
        user_id: string;
        is_active: boolean;
        created_at: Date;
    }[]>;
    findOne(id: string): Promise<Dispatcher>;
    create(dto: Partial<Dispatcher>): Promise<Dispatcher>;
    update(id: string, dto: Partial<Dispatcher>): Promise<Dispatcher>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
