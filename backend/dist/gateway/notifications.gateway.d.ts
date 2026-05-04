import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSubscribe(data: {
        room: string;
    }, client: Socket): {
        event: string;
        room: string;
    };
    emitLoadCreated(load: any): void;
    emitLoadStatusChanged(payload: {
        id: string;
        status: string;
        updatedAt: Date;
    }): void;
    emitLoadDelivered(load: any): void;
    emitStatsUpdated(stats: any): void;
}
