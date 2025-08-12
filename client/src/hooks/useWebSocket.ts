import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';
import toast from 'react-hot-toast';

interface WebSocketMessage {
  chatId: string;
  message: string;
  senderId: string;
  timestamp: string;
}

interface WebSocketNotification {
  type: string;
  title: string;
  body: string;
  chatId: string;
  senderId: string;
  timestamp: string;
}

interface CustomSocket extends Socket {
  _isAuthenticated?: boolean;
  _currentChatId?: string;
}

export const useWebSocket = () => {
  const socketRef = useRef<CustomSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const connect = useCallback(() => {
    const token = authService.getToken();
    
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token: token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    socketRef.current.on('connect', () => {
      socketRef.current!._isAuthenticated = true;
      
      if (socketRef.current!._currentChatId) {
        const chatId = socketRef.current!._currentChatId;
        setTimeout(() => {
          if (chatId) {
            joinChat(chatId);
          }
        }, 500);
      }
    });

    socketRef.current.on('disconnect', () => {
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setTimeout(() => {
        socketRef.current?.connect();
      }, 2000);
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });    
  
    return socketRef.current;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const joinChat = useCallback((chatId: string) => {
    if (socketRef.current) {
      socketRef.current._currentChatId = chatId;
    }
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinChat', { chatId });
      
      setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('verifyJoin', { chatId }, (response: any) => {
            if (response && response.success) {
            } else {
              socketRef.current?.emit('joinChat', { chatId });
            }
          });
        }
      }, 1000);
    } else {
      const socket = connect();
      
      if (socket) {
        setTimeout(() => {
          if (socket.connected) {
            socket.emit('joinChat', { chatId });
          }
        }, 1000);
      }
    }
  }, [connect]);

  const leaveChat = useCallback((chatId: string) => { 
    if (socketRef.current && socketRef.current._currentChatId === chatId) {
      socketRef.current._currentChatId = undefined;
    }
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveChat', { chatId });
    } else {
    }
  }, []);

  const onNewMessage = useCallback((callback: (data: WebSocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('newMessage', (data) => {
        callback(data);
      });
    } 
  }, []);

  const onChatUpdate = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('chatUpdate', (data) => {
        callback(data);
      });
    } 
  }, []);

  const onNotification = useCallback((callback: (data: WebSocketNotification) => void) => {
    if (socketRef.current) {
      socketRef.current.on('notification', (data) => {
        
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.error('Failed to play notification sound:', err);
          });
        }

        if (Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.body,
            icon: '/vite.svg',
            badge: '/vite.svg',
          });
        }

        callback(data);
      });
    } 
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notifications disabled');
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('newMessage');
      socketRef.current.off('chatUpdate');
      socketRef.current.off('notification');
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      cleanup();
      disconnect();
    };
  }, [user, connect, disconnect, cleanup, requestNotificationPermission]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    joinChat,
    leaveChat,
    onNewMessage,
    onChatUpdate,
    onNotification,
    requestNotificationPermission,
    isConnected: socketRef.current?.connected || false,
  };
};
