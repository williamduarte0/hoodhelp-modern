import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, ArrowLeft, Send, Archive, X } from 'lucide-react';
import { useChat, useSendMessage, useCloseChat, useArchiveChat } from '../hooks/useChats';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

export const ChatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat, isLoading, error } = useChat(id || '');
  const sendMessageMutation = useSendMessage();
  const closeChatMutation = useCloseChat();
  const archiveChatMutation = useArchiveChat();

  const { joinChat, leaveChat, onNewMessage, onNotification } = useWebSocket();

  const previousRoute = location.state?.from || '/chats';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (id) {
      joinChat(id);

      onNewMessage((data) => {
        if (data.chatId === id) {
          queryClient.invalidateQueries({ queryKey: ['chats', 'detail', id] });
          toast.success('New message received!');
        }
      });

      onNotification((data) => {
        if (data.chatId === id) {
          toast.success('New notification!');
        }
      });

      return () => {
        leaveChat(id);
      };
    }
  }, [id, joinChat, leaveChat, onNewMessage, onNotification, queryClient]);

  useEffect(() => {
    if (chat?.messages) {
      scrollToBottomInstant();
    }
  }, [chat?.messages]);

  useEffect(() => {
    scrollToBottomInstant();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !chat) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load chat. Please try again.</p>
            <Button onClick={() => navigate(previousRoute)} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isServiceOwner = user?._id === chat.serviceOwnerId._id;
  const otherUserName = isServiceOwner ? chat.interestedUserId.name : chat.serviceOwnerId.name;
  const serviceTitle = chat.serviceId.title;

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await sendMessageMutation.mutateAsync({
        chatId: id!,
        data: { chatId: id!, message: message.trim() }
      });
      setMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCloseChat = async () => {
    try {
      await closeChatMutation.mutateAsync(id!);
      toast.success('Chat closed successfully');
      navigate('/chats');
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const handleArchiveChat = async () => {
    try {
      await archiveChatMutation.mutateAsync(id!);
      toast.success('Chat archived successfully');
      navigate('/chats');
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(previousRoute)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{serviceTitle}</h1>
              <p className="text-gray-600">Chat with {otherUserName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isServiceOwner && (
              <Button onClick={handleCloseChat} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Close Chat
              </Button>
            )}
            <Button onClick={handleArchiveChat} variant="outline" size="sm">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="h-96 overflow-y-auto mb-4 space-y-4 scrollbar-hide">
                  {chat.messages.map((msg, index) => {
                    let messageText: string;
                    let senderId: string;
                    let timestamp: string;
                    let senderName: string;

                    if (typeof msg === "string") {
                      messageText = msg;
                      senderId = "";
                      timestamp = new Date().toISOString();
                      senderName = "Unknown";
                    } else {
                      messageText = msg.message;
                      if (typeof msg.senderId === "string") {
                        senderId = msg.senderId;
                        senderName = "Unknown";
                      } else {
                        senderId = msg.senderId._id;
                        senderName = msg.senderId.name;
                      }
                      timestamp = msg.timestamp;
                    }

                    const isOwnMessage = senderId === user?._id;

                    return (
                      <div
                        key={index}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {isOwnMessage ? "You" : senderName}
                          </div>
                          <div className="text-sm">{messageText}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-4">Chat Info</CardTitle>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{serviceTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      variant={
                        chat.status === "active" ? "default" : "secondary"
                      }
                    >
                      {chat.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-sm">
                      {formatDate(chat.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="text-sm">
                      {formatDate(chat.lastMessageAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-4">Participants</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-sm">
                      {chat.serviceOwnerId.name}
                    </span>
                    <Badge variant="outline" className="text-xs">Owner</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-sm">
                      {chat.interestedUserId.name}
                    </span>
                    <Badge variant="outline" className="text-xs">Interested</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
