import { Injectable, CanActivate, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);
  
  constructor(private jwtService: JwtService) {}

  canActivate(context: any): boolean {
    const client: Socket = context.switchToWs().getClient();
    
    const authToken = client.handshake.auth.token;
    const headerToken = client.handshake.headers.authorization?.replace('Bearer ', '');
    const token = authToken || headerToken;
    
    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      
      const userId = String(payload.sub);
      
      (client as any).userId = userId;
      
      return true;
    } catch (err) {
      return false;
    }
  }
}
