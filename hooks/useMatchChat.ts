import { useEffect, useState, useCallback, useRef } from 'react';
import { ChatMessage, TypingUser } from '@/lib/types';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import { useAppStore } from '@/store/appStore';
import { validateChatMessage } from '@/lib/utils';

export function useMatchChat(matchId: string) {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Typing debounce tracking
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const socket = getSocket();

  // Join chat room on mount
  useEffect(() => {
    // Only join if we have user ID, username, and matchId
    if (!user?.userId || !user?.username || !matchId) {
      console.log('[Chat] Waiting for user data...', { userId: user?.userId, username: user?.username, matchId });
      return;
    }

    // Wait for socket to be ready
    if (!socket.connected) {
      console.log('[Chat] Socket not connected yet, waiting...');
      const checkInterval = setInterval(() => {
        if (socket.connected) {
          clearInterval(checkInterval);
          socket.emit(SOCKET_EVENTS.JOIN_CHAT, {
            matchId,
            userId: user.userId,
            username: user.username,
          });
          console.log('[Chat] Joined room:', matchId);
        }
      }, 100);

      // Cleanup interval on unmount
      return () => {
        clearInterval(checkInterval);
      };
    }

    // Emit join_chat event
    socket.emit(SOCKET_EVENTS.JOIN_CHAT, {
      matchId,
      userId: user.userId,
      username: user.username,
    });

    console.log('[Chat] Joined room:', matchId);

    // Cleanup on unmount - capture current values
    return () => {
      console.log('[Chat] Component unmounting, sending leave_chat');
      
      socket.emit(SOCKET_EVENTS.LEAVE_CHAT, {
        matchId,
        userId: user.userId,
        username: user.username,
      });

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing_stop
      socket.emit(SOCKET_EVENTS.TYPING_STOP, {
        matchId,
        userId: user.userId,
      });

      console.log('[Chat] Left room:', matchId);
    };
  }, [matchId, socket, user?.userId, user?.username]);

  // Setup chat listeners
  useEffect(() => {
    // Handle incoming messages
    const handleChatMessage = (payload: ChatMessage) => {
      console.log('[Chat] Received message:', payload);
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
      console.log('[Chat] User joined:', payload.username);
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
      console.log('[Chat] User left:', payload.username);
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
      console.log('[Chat] Typing indicator:', payload.username, payload.isTyping);
      if (payload.matchId === matchId) {
        setTypingUsers((prev) => {
          if (payload.isTyping) {
            // Add or update typing user (avoid duplicates)
            const filtered = prev.filter((u) => u.userId !== payload.userId);
            return [
              ...filtered,
              {
                userId: payload.userId,
                username: payload.username,
              },
            ];
          } else {
            // Remove typing user
            return prev.filter((u) => u.userId !== payload.userId);
          }
        });
      }
    };

    // Handle error
    const handleError = (payload: { message: string; code?: string }) => {
      console.error('[Chat] Error:', payload);
      if (payload.code === 'RATE_LIMIT') {
        setRateLimited(true);
        setChatError('Too many messages. Please wait before sending another.');
        setTimeout(() => {
          setRateLimited(false);
          setChatError(null);
        }, 5000);
      } else {
        setChatError(payload.message || 'An error occurred');
        setTimeout(() => {
          setChatError(null);
        }, 4000);
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

  // Handle typing with debounce (300ms delay before emitting start, 2s to emit stop)
  const emitTyping = useCallback(
    (isTyping: boolean = true) => {
      if (!user?.userId || !user?.username || !matchId) {
        console.log('[Chat] Cannot emit typing - missing user data');
        return;
      }

      if (!socket.connected) {
        console.log('[Chat] Socket not connected, cannot emit typing');
        return;
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        // Set up new timeout that does TWO things:
        // 1. After 300ms: emit typing_start (if not already sent)
        // 2. After 2s total: emit typing_stop
        typingTimeoutRef.current = setTimeout(() => {
          // First timeout: 300ms - send typing_start if not already sent
          if (!isTypingRef.current && socket.connected) {
            socket.emit(SOCKET_EVENTS.TYPING_START, {
              matchId,
              userId: user.userId,
              username: user.username,
            });
            isTypingRef.current = true;
            console.log('[Chat] Emitted typing_start');

            // Schedule second timeout: auto-stop after additional 1.7s (total 2s)
            typingTimeoutRef.current = setTimeout(() => {
              socket.emit(SOCKET_EVENTS.TYPING_STOP, {
                matchId,
                userId: user.userId,
              });
              isTypingRef.current = false;
              console.log('[Chat] Emitted typing_stop (timeout)');
            }, 1700);
          }
        }, 300);
      } else {
        // Explicitly stop typing
        socket.emit(SOCKET_EVENTS.TYPING_STOP, {
          matchId,
          userId: user.userId,
        });
        isTypingRef.current = false;
        console.log('[Chat] Emitted typing_stop (explicit)');
      }
    },
    [socket, matchId, user?.userId, user?.username]
  );

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const validation = validateChatMessage(text);
      if (!validation.valid) {
        setChatError(validation.error || 'Invalid message');
        return false;
      }

      if (rateLimited || isSending || !user?.userId) {
        return false;
      }

      setIsSending(true);
      setChatError(null);

      try {
        socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
          matchId,
          userId: user.userId,
          username: user.username,
          message: text.trim(),
        });

        console.log('[Chat] Sent message');

        // Reset typing
        emitTyping(false);

        return true;
      } catch (error) {
        setChatError('Failed to send message');
        console.error('[Chat] Send failed:', error);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [matchId, user?.userId, user?.username, socket, rateLimited, isSending, emitTyping]
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
