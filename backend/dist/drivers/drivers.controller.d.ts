import { DriversService } from './drivers.service';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
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
    getMetrics(): Promise<{
        active: number;
        on_trip: number;
        total: number;
        avg_loads_per_driver: number;
    }>;
    findOne(id: string): Promise<import("./driver.entity").Driver>;
    create(body: any): Promise<import("./driver.entity").Driver>;
    update(id: string, body: any): Promise<import("./driver.entity").Driver>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
