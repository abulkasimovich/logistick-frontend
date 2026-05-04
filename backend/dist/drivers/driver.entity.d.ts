export declare class Driver {
    id: string;
    name: string;
    truck_type: string;
    terminal: string;
    status: 'active' | 'on_trip' | 'rest' | 'inactive';
    phone: string;
    license_number: string;
    created_at: Date;
}
