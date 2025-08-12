import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { ChatsGateway } from './chats.gateway';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private chatsGateway: ChatsGateway,
  ) {}

  async create(createChatDto: CreateChatDto, userId: string): Promise<Chat> {
    const service = await this.serviceModel.findById(createChatDto.serviceId).exec();
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.requesterId.toString() === userId) {
      throw new BadRequestException('Service owner cannot create a chat for their own service');
    }

    if (createChatDto.interestedUserId !== userId) {
      throw new BadRequestException('You can only create chats for yourself');
    }

    const existingChat = await this.chatModel.findOne({
      serviceId: createChatDto.serviceId,
      interestedUserId: createChatDto.interestedUserId,
    });

    if (existingChat) {
      if (existingChat.serviceOwnerId.toString() === existingChat.interestedUserId.toString()) {
        await this.chatModel.findByIdAndDelete(existingChat._id).exec();
      } else {
        return existingChat;
      }
    }

    const chat = new this.chatModel({
      ...createChatDto,
      serviceOwnerId: service.requesterId,
    });

    const savedChat = await chat.save();
    
    return savedChat;
  }

  async findByServiceOwner(serviceOwnerId: string): Promise<Chat[]> {
    const chats = await this.chatModel
      .find({
        $or: [
          { serviceOwnerId: new Types.ObjectId(serviceOwnerId) },
          { serviceOwnerId: serviceOwnerId }
        ]
      })
      .populate('interestedUserId', 'name email')
      .populate('serviceId', 'title description budget')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .exec();
    
    return chats;
  }

  async findByInterestedUser(interestedUserId: string): Promise<Chat[]> {
    const chats = await this.chatModel
      .find({
        $or: [
          { interestedUserId: new Types.ObjectId(interestedUserId) },
          { interestedUserId: interestedUserId }
        ]
      })
      .populate('serviceOwnerId', 'name email')
      .populate('serviceId', 'title description budget')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .exec();
    
    return chats;
  }

  async findByService(serviceId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ serviceId: new Types.ObjectId(serviceId) })
      .populate('interestedUserId', 'name email')
      .populate('serviceOwnerId', 'name email')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Chat> {
    const chat = await this.chatModel
      .findById(id)
      .populate('serviceOwnerId', 'name email')
      .populate('interestedUserId', 'name email')
      .populate('serviceId', 'title description budget')
      .populate('messages.senderId', 'name email')
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async sendMessage(chatId: string, sendMessageDto: SendMessageDto, userId: string): Promise<Chat> {
    
    const chat = await this.findById(chatId);
    
    const serviceOwnerIdStr = String(chat.serviceOwnerId._id || chat.serviceOwnerId);
    const interestedUserIdStr = String(chat.interestedUserId._id || chat.interestedUserId);
    const userIdStr = String(userId);
    
    
    if (serviceOwnerIdStr !== userIdStr && interestedUserIdStr !== userIdStr) {
      throw new ForbiddenException('You are not part of this chat');
    }

    if (chat.messages.length > 0 && typeof chat.messages[0] === 'string') {
      const oldMessages = chat.messages as unknown as string[];
      const migratedMessages = oldMessages.map((msg: string) => ({
        message: msg,
        senderId: new Types.ObjectId(serviceOwnerIdStr),
        timestamp: new Date()
      }));
      (chat as any).messages = migratedMessages;
    }

    const newMessage = {
      message: sendMessageDto.message,
      senderId: new Types.ObjectId(userIdStr),
      timestamp: new Date()
    };
    
    
    (chat as any).messages.push(newMessage);
    chat.lastMessage = sendMessageDto.message;
    chat.lastMessageAt = new Date();
    
    const updatedChat = await (chat as ChatDocument).save();

    try {
      await this.chatsGateway.emitNewMessage(chatId, {
        message: sendMessageDto.message,
        senderId: userIdStr,
        chatId: chatId,
      });
    } catch (error) {
    }

    const otherUserId = serviceOwnerIdStr === userIdStr ? interestedUserIdStr : serviceOwnerIdStr;
    try {
      await this.chatsGateway.emitNotification(otherUserId, {
        type: 'newMessage',
        title: 'New Message',
        body: `You have a new message in chat`,
        chatId: chatId,
        senderId: userIdStr,
      });
    } catch (error) {
    }

    return updatedChat;
  }

  async closeChat(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.findById(chatId);

    const serviceOwnerIdStr = chat.serviceOwnerId._id ? chat.serviceOwnerId._id.toString() : chat.serviceOwnerId.toString();
    
    if (serviceOwnerIdStr !== userId) {
      throw new ForbiddenException('Only the service owner can close this chat');
    }

    chat.status = 'closed';
    return (chat as ChatDocument).save();
  }

  async archiveChat(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.findById(chatId);

    const serviceOwnerIdStr = chat.serviceOwnerId._id ? chat.serviceOwnerId._id.toString() : chat.serviceOwnerId.toString();
    const interestedUserIdStr = chat.interestedUserId._id ? chat.interestedUserId._id.toString() : chat.interestedUserId.toString();
    
    if (serviceOwnerIdStr !== userId && interestedUserIdStr !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    chat.status = 'archived';
    return (chat as ChatDocument).save();
  }
}
