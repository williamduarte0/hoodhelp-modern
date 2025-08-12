import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @Request() req) {
    return this.chatsService.create(createChatDto, req.user.userId);
  }

  @Get('my-chats')
  findMyChats(@Request() req) {
    return this.chatsService.findByServiceOwner(req.user.userId);
  }

  @Get('interested')
  findInterestedChats(@Request() req) {
    return this.chatsService.findByInterestedUser(req.user.userId);
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId') serviceId: string) {      
    return this.chatsService.findByService(serviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatsService.findById(id);
  }

  @Post(':id/message')
  sendMessage(
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req,
  ) {
    return this.chatsService.sendMessage(id, sendMessageDto, req.user.userId);
  }

  @Patch(':id/close')
  closeChat(@Param('id') id: string, @Request() req) {
    return this.chatsService.closeChat(id, req.user.userId);
  }

  @Patch(':id/archive')
  archiveChat(@Param('id') id: string, @Request() req) {
    return this.chatsService.archiveChat(id, req.user.userId);
  }
}
