import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from '../auth/auth.module';
import { UsersService } from '../users/users.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/events',
})
export class EventsGateway {
  @Inject(forwardRef(() => UsersService))
  private readonly usersService: UsersService;
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async randomMessage() {
    let delay = 0;
    while (true) {
      delay = Math.floor(Math.random() * 20000);
      await this.sleep(delay);
      this.server.emit('message', 'random message');
    }
  }

  afterInit() {
    this.logger.log('Events gateway started');
    this.randomMessage();
  }

  async handleConnection(client: Socket) {
    let token: string;
    try {
      token = client.handshake.headers.authorization.split(' ')[1];
    } catch {
      client.emit('error', {
        error: 'Unauthorized',
        message: 'no token provided',
      });
      client.disconnect();
    }
    try {
      new JwtService().verify(token, { secret: jwtSecret });
      const decodedToken = new JwtService().decode(token);
      const user = await this.usersService.getOne(decodedToken?.['userId']);
      client['user'] = user;
      this.logger.log(`User connected : ${user.pseudo}`);

      client.emit('welcome', `welcome ${user.pseudo}`);
      client.broadcast.emit('message', `New user connected : ${user.pseudo}`);
    } catch {
      client.emit('error', {
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 401,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client) {
    const user =
      client.user !== undefined ? client.user.pseudo : 'Unknown user';
    this.logger.log(`${user} disconnected`);
  }

  @SubscribeMessage('message')
  handleEvent(client: Socket, data: unknown) {
    this.logger.log('message received', data);
    client.emit('message', 'aknowledged');
    //? return { event: 'message', data: 'aknowledged' };
  }
}
