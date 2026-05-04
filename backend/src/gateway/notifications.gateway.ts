import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log(`WS connected: ${payload.email}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`WS disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:room')
  handleSubscribe(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    return { event: 'subscribed', room: data.room };
  }

  // Emit helpers (called from services)
  emitLoadCreated(load: any) {
    this.server.to('loads').emit('load:created', load);
  }

  emitLoadStatusChanged(payload: { id: string; status: string; updatedAt: Date }) {
    this.server.to('loads').emit('load:status_changed', payload);
  }

  emitLoadDelivered(load: any) {
    this.server.emit('load:delivered', load);
    this.server.emit('notification:new', {
      title: `Load ${load.load_number} delivered`,
      body: `${load.driver?.name} → ${load.destination}`,
      type: 'success',
    });
  }

  emitStatsUpdated(stats: any) {
    this.server.emit('stats:updated', stats);
  }
}
