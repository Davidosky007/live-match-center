'use client';

import { useAppStore } from '@/store/appStore';

export function ConnectionStatusBar() {
  const status = useAppStore((state) => state.status);
  const reconnectAttempt = useAppStore((state) => state.reconnectAttempt);

  // Only show when connection is degraded
  if (status === 'connected') {
    return null;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 text-center py-2 text-xs font-medium text-white
        ${status === 'reconnecting' ? 'bg-warn/90' : 'bg-error/90'}
        ${status === 'reconnecting' ? 'slide-down' : ''}
      `}
      role="status"
      aria-live="assertive"
    >
      {status === 'reconnecting' ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>
            Reconnecting{reconnectAttempt > 0 && ` (attempt ${reconnectAttempt})`}...
          </span>
        </div>
      ) : (
        <span>🔴 Disconnected — Trying to reconnect...</span>
      )}
    </div>
  );
}
