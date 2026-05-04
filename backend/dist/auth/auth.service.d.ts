import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: "admin" | "dispatcher" | "analyst" | "driver";
        };
    }>;
    refresh(userId: string, refreshToken: string): Promise<{
        access_token: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin" | "dispatcher" | "analyst" | "driver";
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
}
