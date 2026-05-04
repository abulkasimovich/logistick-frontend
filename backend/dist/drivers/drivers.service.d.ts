import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import { Load } from '../loads/load.entity';
export declare class DriversService {
    private readonly driverRepo;
    private readonly loadRepo;
    constructor(driverRepo: Repository<Driver>, loadRepo: Repository<Load>);
    findAll(sort?: string, order?: string): Promise<{
        rank: number;
        loads: number;
        revenue: number;
        miles: number;
        fuel: number;
        driver_pay: number;
        rpm: string;
        id: string;
        name: string;
        truck_type: string;
        terminal: string;
        status: "active" | "on_trip" | "rest" | "inactive";
        phone: string;
        license_number: string;
        created_at: Date;
    }[]>;
    findOne(id: string): Promise<Driver>;
    create(dto: Partial<Driver>): Promise<Driver>;
    update(id: string, dto: Partial<Driver>): Promise<Driver>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getMetrics(): Promise<{
        active: number;
        on_trip: number;
        total: number;
        avg_loads_per_driver: number;
    }>;
}
