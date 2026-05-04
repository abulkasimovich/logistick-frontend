import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Load } from '../loads/load.entity';
export declare class CustomersService {
    private readonly custRepo;
    private readonly loadRepo;
    constructor(custRepo: Repository<Customer>, loadRepo: Repository<Load>);
    findAll(): Promise<{
        loads: number;
        revenue: number;
        revenue_share: string;
        id: string;
        name: string;
        contact_email: string;
        phone: string;
        address: string;
        is_active: boolean;
        created_at: Date;
    }[]>;
    findOne(id: string): Promise<Customer>;
    create(dto: Partial<Customer>): Promise<Customer>;
    update(id: string, dto: Partial<Customer>): Promise<Customer>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
