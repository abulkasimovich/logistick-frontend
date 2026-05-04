import { LoadsService } from './loads.service';
export declare class LoadsController {
    private readonly loadsService;
    constructor(loadsService: LoadsService);
    findAll(query: any): Promise<{
        data: import("./load.entity").Load[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./load.entity").Load>;
    create(body: any): Promise<import("./load.entity").Load>;
    update(id: string, body: any): Promise<import("./load.entity").Load>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
        id: string;
        status: "delivered" | "in_transit" | "booked" | "cancelled";
        delivered_at: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
