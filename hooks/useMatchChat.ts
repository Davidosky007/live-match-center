import { useEffect, useState, useCallback } from 'react';
import { ChatMessage, TypingUser } from '@/lib/types';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import { useAppStore } from '@/store/appStore';
import { validateChatMessage, debounce } from '@/lib/utils';

export function useMatchChat(matchId: string) {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const socket = getSocket();

  // Join on mount
  useEffect(() => {
    socket.emit(SOCKET_EVENTS.JOIN_CHAT, {
      matchId,
      userId: user?.userId,
      username: user?.username,
    });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_CHAT, { matchId });
    };
  }, [matchId, socket, user?.userId, user?.username]);

  // Setup chat listeners
  useEffect(() => {
    // Handle incoming messages
    const handleChatMessage = (payload: ChatMessage) => {
      if (payload.matchId === matchId) {
        setMessages((prev) => {
          // Limit to 200 messages
          const updated = [...prev, payload];
          return updated.slice(Math.max(0, updated.length - 200));
        });
        setChatError(null);
      }
    };

    // Handle user joined
    const handleUserJoined = (payload: { matchId: string; username: string }) => {
      if (payload.matchId === matchId) {
        setMessages((prev) => [
          ...prev,
          {
            matchId,
            userId: 'system',
            username: 'System',
            message: `${payload.username} joined the chat`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    // Handle user left
    const handleUserLeft = (payload: { matchId: string; username: string }) => {
      if (payload.matchId === matchId) {
        setMessages((prev) => [
          ...prev,
          {
            matchId,
            userId: 'system',
            username: 'System',
            message: `${payload.username} left the chat`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    // Handle typing indicator
    const handleTypingIndicator = (payload: {
      matchId: string;
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (payload.matchId === matchId) {
        setTypingUsers((prev) => {
          if (payload.isTyping) {
            // Add or update typing user
            return prev.filter((u) => u.userId !== payload.userId).concat({
              userId: payload.userId,
              username: payload.username,
            });
          } else {
            // Remove typing user
            return prev.filter((u) => u.userId !== payload.userId);
          }
        });
      }
    };

    // Handle error
    const handleError = (payload: { message: string; code?: string }) => {
      if (payload.code === 'RATE_LIMIT') {
        setRateLimited(true);
        setChatError('Too many messages. Please wait before sending another.');
        setTimeout(() => {
          setRateLimited(false);
          setChatError(null);
        }, 5000);
      } else {
        setChatError(payload.message || 'An error occurred');
      }
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socket.on(SOCKET_EVENTS.TYPING_INDICATOR, handleTypingIndicator);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.TYPING_INDICATOR, handleTypingIndicator);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, [matchId, socket]);

  // Debounced typing indicator
  const emitTyping = useCallback(() => {
    socket.emit(SOCKET_EVENTS.TYPING_STOP, {
      matchId,
      userId: user?.userId,
    });
  }, [socket, matchId, user?.userId]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const validation = validateChatMessage(text);
      if (!validation.valid) {
        setChatError(validation.error || 'Invalid message');
        return false;
      }

      if (rateLimited || isSending) {
        return false;
      }

      setIsSending(true);
      setChatError(null);

      try {
        socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
          matchId,
          userId: user?.userId,
          username: user?.username,
          message: text.trim(),
        });

        // Reset typing
        socket.emit(SOCKET_EVENTS.TYPING_STOP, {
          matchId,
          userId: user?.userId,
        });

        return true;
      } catch (error) {
        setChatError('Failed to send message');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [matchId, user?.userId, user?.username, socket, rateLimited, isSending]
  );

  return {
    messages,
    typingUsers,
    isSending,
    rateLimited,
    chatError,
    sendMessage,
    emitTyping,
  };
}
