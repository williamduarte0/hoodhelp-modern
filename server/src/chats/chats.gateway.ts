import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { Chat, ChatDocument } from './schemas/chat.schema';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();
  private readonly logger = new Logger(ChatsGateway.name);

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }
      
      (client as any)._token = token;
      
      try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        
        if (userId) {
          client.userId = userId;
          this.userSockets.set(userId, client.id);
          
          client.join(`user:${userId}`);
          return;
        }
      } catch (e) {
        client.disconnect();
        return;
      }
      
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    
    if (client.userId) {
      this.userSockets.delete(client.userId);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string }
  ) {
    
    if (!client.userId) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const roomName = `chat:${data.chatId}`;
    
    try {
      await this.leaveAllChatRooms(client);
      
      await client.join(roomName);
      
      const rooms = Array.from(client.rooms.values());
      
      return { success: true, room: roomName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  @SubscribeMessage('verifyJoin')
  async handleVerifyJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string }
  ) {
    if (!client.userId) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const roomName = `chat:${data.chatId}`;
    const isInRoom = client.rooms.has(roomName);
    
    
    if (!isInRoom) {
      await client.join(roomName);
    }
    
    return { success: true, inRoom: isInRoom };
  }
  

  private async leaveAllChatRooms(client: AuthenticatedSocket) {
    const rooms = Array.from(client.rooms.values());
    for (const room of rooms) {
      if (room.startsWith('chat:')) {
        await client.leave(room);
      }
    }
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string }
  ) {
    
    if (!client.userId) {
      return;
    }
    
    const roomName = `chat:${data.chatId}`;
    client.leave(roomName);
  }

  async emitNewMessage(chatId: string, message: any) {
    const roomName = `chat:${chatId}`;
    
    const room = this.server.sockets.adapter.rooms.get(roomName);
    const clientCount = room ? room.size : 0;
    
    const payload = {
      chatId,
      message,
      timestamp: new Date(),
    };
    
    this.server.to(roomName).emit('newMessage', payload);
    
    if (clientCount === 0) {
      
      try {
        const chat = await this.getChatParticipants(chatId);
        if (chat) {
          const serviceOwnerIdStr = String(chat.serviceOwnerId);
          const interestedUserIdStr = String(chat.interestedUserId);
          
          const ownerSocketId = this.userSockets.get(serviceOwnerIdStr);
          if (ownerSocketId) {
            this.server.to(ownerSocketId).emit('newMessage', payload);
          }
          
          const interestedSocketId = this.userSockets.get(interestedUserIdStr);
          if (interestedSocketId) {
            this.server.to(interestedSocketId).emit('newMessage', payload);
          }
        }
      } catch (error) {
      }
    }
  }
  
  private async getChatParticipants(chatId: string) {
    try {
      const chat = await this.chatModel.findById(chatId).exec();
      if (!chat) {
        return null;
      }
      
      return {
        serviceOwnerId: chat.serviceOwnerId,
        interestedUserId: chat.interestedUserId
      };
    } catch (error) {
      return null;
    }
  }

  async emitChatUpdate(userId: string, update: any) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('chatUpdate', update);
    } else {
    }
  }

  async emitNotification(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      const payload = {
        ...notification,
        timestamp: new Date(),
      };
      
      this.server.to(socketId).emit('notification', payload);
    } else {
    }
  }
}
