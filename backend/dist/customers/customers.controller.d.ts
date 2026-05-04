import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
    findOne(id: string): Promise<import("./customer.entity").Customer>;
    create(body: any): Promise<import("./customer.entity").Customer>;
    update(id: string, body: any): Promise<import("./customer.entity").Customer>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
