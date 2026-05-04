import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(body: {
        userId: string;
        refreshToken: string;
    }): Promise<{
        access_token: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin" | "dispatcher" | "analyst" | "driver";
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
}
