import { Repository } from 'typeorm';
import { Load } from './load.entity';
export declare class LoadsService {
    private readonly loadRepo;
    constructor(loadRepo: Repository<Load>);
    findAll(query: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        driver_id?: string;
        customer_id?: string;
    }): Promise<{
        data: Load[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Load>;
    create(dto: Partial<Load>): Promise<Load>;
    update(id: string, dto: Partial<Load>): Promise<Load>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        status: "delivered" | "in_transit" | "booked" | "cancelled";
        delivered_at: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
