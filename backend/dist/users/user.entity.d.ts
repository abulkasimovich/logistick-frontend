export declare class User {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    role: 'admin' | 'dispatcher' | 'analyst' | 'driver';
    refresh_token: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
