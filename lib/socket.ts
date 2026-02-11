import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  'wss://profootball.srv883830.hstgr.cloud';

// Module-scoped singleton to prevent duplicate connections
let socket: Socket | null = null;
let connectionStatusCallback: ((status: 'connected' | 'reconnecting' | 'disconnected', attempt?: number) => void) | null = null;

/**
 * Register a callback to be notified of connection status changes
 */
export function onConnectionStatusChange(
  callback: (status: 'connected' | 'reconnecting' | 'disconnected', attempt?: number) => void
): void {
  connectionStatusCallback = callback;
}

/**
 * Helper to notify connection status change
 */
function notifyConnectionStatus(status: 'connected' | 'reconnecting' | 'disconnected', attempt?: number): void {
  if (connectionStatusCallback) {
    connectionStatusCallback(status, attempt);
  }
}

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
      transports: ['websocket', 'polling'],
      autoConnect: true,
      secure: true,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
      notifyConnectionStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      notifyConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      notifyConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt:', attemptNumber);
      notifyConnectionStatus('reconnecting', attemptNumber);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      notifyConnectionStatus('connected');
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error.message);
      notifyConnectionStatus('reconnecting');
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed - will keep retrying');
      notifyConnectionStatus('disconnected');
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
  TYPING: 'typing',  // Backend sends 'typing' not 'typing_indicator'
  ERROR: 'error',

  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
} as const;
