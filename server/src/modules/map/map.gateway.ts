import { Logger, Query } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 *	Important URIs:
 *	https://docs.nestjs.com/websockets/gateways
 *	https://socket.io/docs/server-api/
 *	https://socket.io/docs/client-api/
 */

interface ActiveUser {
  clientId: string;
  username?: string;
  coordinates?: number[][];
  zoom?: number;
  avatar?: string;
}
interface Payload {
  data: ActiveUser;
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
    this.logger.log(`Client connected: ${client.id}`);
    this.activeUsers.push({ clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    this.activeUsers.forEach((user, i) => {
      if (user.clientId == client.id) {
        this.activeUsers.splice(i, 1);
        console.log('remove user ' + user.clientId);
        this.wss.emit('getActiveUsers', this.activeUsers); // send data to every client
        return;
      }
    });
  }

  @SubscribeMessage('updateActiveUser')
  handleMessage(client: Socket, payload: Payload) {
    for (const user of this.activeUsers) {
      if (user.clientId == client.id) {
        user.username = payload.data.username;
        user.coordinates = payload.data.coordinates;
        user.zoom = payload.data.zoom;
        user.avatar = payload.data.avatar;
      }
    }
    this.wss.emit('getActiveUsers', this.activeUsers); // send data to every client
  }
}
