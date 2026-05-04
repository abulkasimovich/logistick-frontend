import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin" | "dispatcher" | "analyst" | "driver";
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }[]>;
    create(body: {
        email: string;
        name: string;
        password: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin" | "dispatcher" | "analyst" | "driver";
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    updateRole(id: string, body: {
        role: string;
    }): Promise<{
        message: string;
        id: string;
        role: string;
    }>;
}
