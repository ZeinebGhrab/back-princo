import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class ImpressionNotificationGateway {
  @WebSocketServer()
  server: Server;
}
