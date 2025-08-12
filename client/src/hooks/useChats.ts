import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, type Chat, type CreateChatData, type SendMessageData } from '../services';
import toast from 'react-hot-toast';

export type { Chat, CreateChatData, SendMessageData };

export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: (filters: string) => [...chatKeys.lists(), { filters }] as const,
  details: () => [...chatKeys.all, 'detail'] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  myChats: () => [...chatKeys.all, 'my-chats'] as const,
  interestedChats: () => [...chatKeys.all, 'interested'] as const,
  serviceChats: (serviceId: string) => [...chatKeys.all, 'service', serviceId] as const,
};

export const useMyChats = () => {
  return useQuery({
    queryKey: chatKeys.myChats(),
    queryFn: () => chatService.getMyChats(),
    staleTime: 30 * 1000,
  });
};

export const useInterestedChats = () => {
  return useQuery({
    queryKey: chatKeys.interestedChats(),
    queryFn: () => chatService.getInterestedChats(),
    staleTime: 30 * 1000,
  });
};

export const useServiceChats = (serviceId: string) => {
  return useQuery({
    queryKey: chatKeys.serviceChats(serviceId),
    queryFn: () => chatService.getByService(serviceId),
    enabled: !!serviceId,
    staleTime: 30 * 1000,
  });
};

export const useChat = (id: string) => {
  return useQuery({
    queryKey: chatKeys.detail(id),
    queryFn: () => chatService.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatService.create,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.myChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.interestedChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.serviceChats(newChat.serviceId._id) });
      toast.success('Chat started successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error starting chat';
      toast.error(errorMessage);
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: SendMessageData }) => chatService.sendMessage(chatId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(variables.chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.myChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.interestedChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.serviceChats(variables.chatId) });
      toast.success('Message sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });
};

export const useCloseChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatService.closeChat,
    onSuccess: (updatedChat) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(updatedChat._id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.myChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.interestedChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.serviceChats(updatedChat.serviceId._id) });
      toast.success('Chat closed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error closing chat';
      toast.error(errorMessage);
    },
  });
};

export const useArchiveChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatService.archiveChat,
    onSuccess: (updatedChat) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(updatedChat._id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.myChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.interestedChats() });
      queryClient.invalidateQueries({ queryKey: chatKeys.serviceChats(updatedChat.serviceId._id) });
      toast.success('Chat archived successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error archiving chat';
      toast.error(errorMessage);
    },
  });
};
