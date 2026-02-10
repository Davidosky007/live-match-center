import { useEffect, useState, useCallback } from 'react';
import { Match } from '@/lib/types';
import { fetchMatches } from '@/lib/api';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';

interface UseMatchListOptions {
  autoRefetchInterval?: number; // in milliseconds (default: 60000)
}

export function useMatchList(options: UseMatchListOptions = {}) {
  const { autoRefetchInterval = 60000 } = options;
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socket = getSocket();

  // Fetch matches from API
  const fetchAndSetMatches = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMatches();
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch matches'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    setIsLoading(true);
    fetchAndSetMatches();
  }, [fetchAndSetMatches]);

  // Setup WebSocket listeners for match updates
  useEffect(() => {
    // Handle score updates
    const handleScoreUpdate = (payload: any) => {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === payload.matchId
            ? {
                ...match,
                homeScore: payload.homeScore,
                awayScore: payload.awayScore,
                minute: payload.minute,
              }
            : match
        )
      );
    };

    // Handle status changes
    const handleStatusChange = (payload: any) => {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === payload.matchId
            ? {
                ...match,
                status: payload.status,
                minute: payload.minute,
              }
            : match
        )
      );
    };

    socket.on(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
    socket.on(SOCKET_EVENTS.STATUS_CHANGE, handleStatusChange);

    // Polling fallback (every 60s by default)
    const pollInterval = setInterval(() => {
      fetchAndSetMatches();
    }, autoRefetchInterval);

    return () => {
      socket.off(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
      socket.off(SOCKET_EVENTS.STATUS_CHANGE, handleStatusChange);
      clearInterval(pollInterval);
    };
  }, [socket, autoRefetchInterval, fetchAndSetMatches]);

  return {
    matches,
    isLoading,
    error,
    refetch: fetchAndSetMatches,
  };
}
