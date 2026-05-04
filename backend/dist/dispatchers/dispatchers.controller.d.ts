import { DispatchersService } from './dispatchers.service';
export declare class DispatchersController {
    private readonly dispatchersService;
    constructor(dispatchersService: DispatchersService);
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
    findOne(id: string): Promise<import("./dispatcher.entity").Dispatcher>;
    create(body: any): Promise<import("./dispatcher.entity").Dispatcher>;
    update(id: string, body: any): Promise<import("./dispatcher.entity").Dispatcher>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
