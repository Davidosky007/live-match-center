import { useEffect } from 'react';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import { useAppStore } from '@/store/appStore';

/**
 * Hook to manage Socket.IO connection and sync status with store
 */
export function useSocket() {
  const { setConnectionStatus, setLastConnectedAt } = useAppStore();

  useEffect(() => {
    const socket = getSocket();

    // Connection event handlers
    const handleConnect = () => {
      setConnectionStatus('connected', 0);
      setLastConnectedAt(new Date());
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      setConnectionStatus('reconnecting', attemptNumber);
    };

    const handleReconnect = () => {
      setConnectionStatus('connected', 0);
      setLastConnectedAt(new Date());
    };

    // Register listeners
    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on(SOCKET_EVENTS.RECONNECT, handleReconnect);

    // Set initial status
    if (socket.connected) {
      setConnectionStatus('connected', 0);
      setLastConnectedAt(new Date());
    }

    // Cleanup
    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off(SOCKET_EVENTS.RECONNECT, handleReconnect);
    };
  }, [setConnectionStatus, setLastConnectedAt]);

  return {
    socket: getSocket(),
    isConnected: useAppStore((state) => state.status === 'connected'),
    isReconnecting: useAppStore((state) => state.status === 'reconnecting'),
    reconnectAttempt: useAppStore((state) => state.reconnectAttempt),
  };
}
