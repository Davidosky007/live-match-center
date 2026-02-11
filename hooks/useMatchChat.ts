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
   
    if (!user?.userId || !user?.username || !matchId) {
      console.log('[Chat] Waiting for user data...', { userId: user?.userId, username: user?.username, matchId });
      return;
    }

    let hasJoined = false;
    let checkInterval: NodeJS.Timeout | null = null;

  
    const emitJoin = () => {
      socket.emit(SOCKET_EVENTS.JOIN_CHAT, {
        matchId,
        userId: user.userId,
        username: user.username,
      });
      hasJoined = true;
      console.log('[Chat] Joined room:', matchId);
    };

    
    if (!socket.connected) {
      console.log('[Chat] Socket not connected yet, waiting...');
      checkInterval = setInterval(() => {
        if (socket.connected) {
          if (checkInterval) clearInterval(checkInterval);
          emitJoin();
        }
      }, 100);
    } else {
     
      emitJoin();
    }

   
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }

    
      if (hasJoined) {
        console.log('[Chat] Component unmounting, sending leave_chat');
        socket.emit(SOCKET_EVENTS.LEAVE_CHAT, {
          matchId,
          userId: user.userId,
          username: user.username,
        });
      }

     
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

     
      if (isTypingRef.current) {
        socket.emit(SOCKET_EVENTS.TYPING_STOP, {
          matchId,
          userId: user.userId,
        });
      }
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

    console.log('[Chat] Setting up socket listeners for matchId:', matchId);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    console.log('[Chat] Registering TYPING listener on event:', SOCKET_EVENTS.TYPING);
    socket.on(SOCKET_EVENTS.TYPING, handleTypingIndicator);
    // Also listen to typing_indicator for compatibility
    socket.on(SOCKET_EVENTS.TYPING_INDICATOR, handleTypingIndicator);
    socket.on(SOCKET_EVENTS.ERROR, handleError);
    console.log('[Chat] All listeners registered');

    // DEBUG: Log all events from server
    socket.onAny((eventName: string, ...args: any[]) => {
      console.log('[Chat] SERVER EVENT RECEIVED:', eventName, args);
    });

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.TYPING, handleTypingIndicator);
      socket.off(SOCKET_EVENTS.TYPING_INDICATOR, handleTypingIndicator);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, [matchId, socket]);

  // Handle typing with proper debounce (send start on first keystroke, debounce stop after 2s)
  const emitTyping = useCallback(
    (isTyping: boolean = true) => {
      if (!user?.userId || !user?.username || !matchId) {
        console.log('[Chat] Cannot emit typing - missing user data', { userId: user?.userId, username: user?.username, matchId });
        return;
      }

      // Get fresh socket reference
      const currentSocket = getSocket();
      
      if (!currentSocket || !currentSocket.connected) {
        console.log('[Chat] Socket not connected, cannot emit typing', { connected: currentSocket?.connected });
        return;
      }

      console.log('[Chat] emitTyping called with isTyping=', isTyping, 'isTypingRef.current=', isTypingRef.current);

      if (isTyping) {
        // Only send typing_start if not already typing
        if (!isTypingRef.current) {
          console.log('[Chat] Emitting TYPING_START event');
          currentSocket.emit(SOCKET_EVENTS.TYPING_START, {
            matchId,
            userId: user.userId,
            username: user.username,
          });
          isTypingRef.current = true;
          console.log('[Chat] Emitted typing_start');
        } else {
          console.log('[Chat] Already typing, skipping typing_start');
        }

        // Clear any existing stop timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to emit typing_stop after 2s of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          console.log('[Chat] Typing timeout - emitting TYPING_STOP');
          const socket = getSocket();
          if (socket?.connected) {
            socket.emit(SOCKET_EVENTS.TYPING_STOP, {
              matchId,
              userId: user.userId,
            });
          }
          isTypingRef.current = false;
          console.log('[Chat] Emitted typing_stop (timeout)');
        }, 2000);
      } else {
        // Explicitly stop typing
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        console.log('[Chat] Emitting explicit TYPING_STOP');
        currentSocket.emit(SOCKET_EVENTS.TYPING_STOP, {
          matchId,
          userId: user.userId,
        });
        isTypingRef.current = false;
        console.log('[Chat] Emitted typing_stop (explicit)');
      }
    },
    [matchId, user?.userId, user?.username]
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
