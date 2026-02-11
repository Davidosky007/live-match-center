'use client';

import { useEffect } from 'react';
import { getSocket, onConnectionStatusChange } from '@/lib/socket';
import { useAppStore } from '@/store/appStore';

/**
 * Hook to initialize socket connection and sync status with app store
 * Call this once at app root level (in layout or root component)
 */
export function useSocketConnection() {
  const setConnectionStatus = useAppStore((state) => state.setConnectionStatus);
  const setLastConnectedAt = useAppStore((state) => state.setLastConnectedAt);

  useEffect(() => {
    // Initialize socket and register status callback
    const socket = getSocket();

    // Setup connection status callback
    const handleConnectionStatusChange = (
      status: 'connected' | 'reconnecting' | 'disconnected',
      attempt?: number
    ) => {
      console.log('[App] Connection status:', status, attempt);
      setConnectionStatus(status, attempt);

      if (status === 'connected') {
        setLastConnectedAt(new Date());
      }
    };

    // Register callback
    onConnectionStatusChange(handleConnectionStatusChange);

    // Set initial status based on current socket state
    if (socket.connected) {
      handleConnectionStatusChange('connected');
    }

    return () => {
      // No cleanup needed - keep socket alive
    };
  }, [setConnectionStatus, setLastConnectedAt]);
}
