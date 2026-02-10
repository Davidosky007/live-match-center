import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  'wss://profootball.srv883830.hstgr.cloud';

// Module-scoped singleton to prevent duplicate connections
let socket: Socket | null = null;

/**
 * Get or create Socket.IO client instance (singleton)
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      transports: ['websocket'],
      autoConnect: true,
    });

    // Global connection event handlers for debugging
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
    });
  }

  return socket;
}

/**
 * Disconnect and destroy socket instance
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
    console.log('[Socket] Disconnected and destroyed');
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

// WebSocket event names (for reference and type safety)
export const SOCKET_EVENTS = {
  // Client -> Server
  SUBSCRIBE_MATCH: 'subscribe_match',
  UNSUBSCRIBE_MATCH: 'unsubscribe_match',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  SEND_MESSAGE: 'send_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',

  // Server -> Client
  SCORE_UPDATE: 'score_update',
  STATUS_CHANGE: 'status_change',
  MATCH_EVENT: 'match_event',
  STATS_UPDATE: 'stats_update',
  CHAT_MESSAGE: 'chat_message',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  TYPING_INDICATOR: 'typing_indicator',
  ERROR: 'error',

  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
} as const;
