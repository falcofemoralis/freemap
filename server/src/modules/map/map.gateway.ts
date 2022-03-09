import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { AuthService } from './../auth/auth.service';
import { Logger, Query, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ActiveUser } from './types/active-user';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { MapService } from './map.service';

/**
 *	Important URIs:
 *	https://docs.nestjs.com/websockets/gateways
 *	https://socket.io/docs/server-api/
 *	https://socket.io/docs/client-api/
 */

interface Payload {
  data: Pick<ActiveUser, 'coordinates' | 'zoom'>;
}

// @WebSocketGateway({serveClient: true})
@WebSocketGateway({ namespace: 'map', cors: true })
export class MapGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppGateway');
  private activeUsers: ActiveUser[] = [];

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized .....');
  }

  handleConnection(client: Socket) {
    console.log('query is');
    console.log(client.handshake.query);

    this.logger.log(`Client connected: ${client.id}`);
    this.activeUsers.push({ ...(client.handshake.query as any), clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    this.activeUsers.forEach((user, i) => {
      if (user.clientId == client.id) {
        this.activeUsers.splice(i, 1);
        this.wss.emit('getActiveUsers', this.activeUsers); // send data to every client
        return;
      }
    });
  }

  @SubscribeMessage('updateActiveUser')
  handleMessage(client: Socket, payload: Payload) {
    for (const user of this.activeUsers) {
      if (user.clientId == client.id) {
        user.coordinates = payload.data.coordinates;
        user.zoom = payload.data.zoom;
      }
    }
    this.wss.emit('getActiveUsers', this.activeUsers); // send data to every client
  }
}
