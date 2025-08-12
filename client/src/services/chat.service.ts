import { ApiClient } from './api';
import type { Chat, CreateChatData, SendMessageData } from './types';

export const chatService = {
  getMyChats: (): Promise<Chat[]> => {
    return ApiClient.get<Chat[]>('/chats/my-chats');
  },

  getInterestedChats: (): Promise<Chat[]> => {
    return ApiClient.get<Chat[]>('/chats/interested');
  },

  getByService: (serviceId: string): Promise<Chat[]> => {
    return ApiClient.get<Chat[]>(`/chats/service/${serviceId}`);
  },

  getById: (id: string): Promise<Chat> => {
    return ApiClient.get<Chat>(`/chats/${id}`);
  },

  create: (data: CreateChatData): Promise<Chat> => {
    return ApiClient.post<Chat>('/chats', data);
  },

  sendMessage: (chatId: string, data: SendMessageData): Promise<Chat> => {
    return ApiClient.post<Chat>(`/chats/${chatId}/message`, data);
  },

  closeChat: (chatId: string): Promise<Chat> => {
    return ApiClient.patch<Chat>(`/chats/${chatId}/close`, {});
  },

  archiveChat: (chatId: string): Promise<Chat> => {
    return ApiClient.patch<Chat>(`/chats/${chatId}/archive`, {});
  },
};
