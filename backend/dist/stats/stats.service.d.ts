import { Repository } from 'typeorm';
import { Load } from '../loads/load.entity';
export declare class StatsService {
    private readonly loadRepo;
    constructor(loadRepo: Repository<Load>);
    private getDateRange;
    getOverview(period?: string): Promise<{
        revenue: number;
        profit: number;
        margin: string;
        miles: number;
        rpm: string;
        fuel: number;
        fcpm: string;
        total_loads: number;
        avg_rev_load: number;
        delivered: number;
        delivery_rate: string;
        in_transit: number;
        booked: number;
        cancelled: number;
        driver_pay: number;
    }>;
    getMonthly(period?: string): Promise<{
        month: any;
        revenue: number;
        profit: number;
        loads: number;
        fuel: number;
        miles: number;
        driver_pay: number;
    }[]>;
    getFinancials(period?: string): Promise<{
        totals: {
            revenue: number;
            profit: number;
            fuel: number;
            driver_pay: number;
        };
        exp_pct: {
            profit: number;
            driver_pay: number;
            fuel: number;
        };
        monthly: {
            month: any;
            revenue: number;
            profit: number;
            loads: number;
            fuel: number;
            miles: number;
            driver_pay: number;
        }[];
    }>;
}
