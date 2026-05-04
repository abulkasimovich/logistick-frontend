import { Driver } from '../drivers/driver.entity';
import { Customer } from '../customers/customer.entity';
export declare class Load {
    id: string;
    load_number: string;
    status: 'delivered' | 'in_transit' | 'booked' | 'cancelled';
    origin: string;
    destination: string;
    truck_type: string;
    miles: number;
    revenue: number;
    fuel_cost: number;
    driver_pay: number;
    driver_id: string;
    driver: Driver;
    customer_id: string;
    customer: Customer;
    dispatcher_id: string;
    created_at: Date;
    delivered_at: Date;
}
