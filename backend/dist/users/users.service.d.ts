import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin" | "dispatcher" | "analyst" | "driver";
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }[]>;
    create(dto: {
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
    updateRole(id: string, role: string): Promise<{
        message: string;
        id: string;
        role: string;
    }>;
    deactivate(id: string): Promise<{
        message: string;
    }>;
}
