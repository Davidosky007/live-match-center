import { useEffect, useState, useCallback } from 'react';
import { MatchDetail } from '@/lib/types';
import { fetchMatchDetail } from '@/lib/api';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';

export function useMatchDetail(matchId: string) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMinute, setLocalMinute] = useState<number>(0);

  const socket = getSocket();

  const fetchDetail = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMatchDetail(matchId);
      setMatch(data);
      setLocalMinute(data.minute);
    } catch (err) {
      console.error('Error fetching match detail:', err);
      if ((err as any).message === 'Match not found') {
        setError('Match not found');
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch match details'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // Fetch on mount
  useEffect(() => {
    setIsLoading(true);
    fetchDetail();
  }, [matchId, fetchDetail]);

  // Subscribe to match and setup listeners
  useEffect(() => {
    // Emit subscription
    socket.emit(SOCKET_EVENTS.SUBSCRIBE_MATCH, { matchId });

    // Handle score updates
    const handleScoreUpdate = (payload: any) => {
      if (payload.matchId === matchId) {
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                homeScore: payload.homeScore,
                awayScore: payload.awayScore,
              }
            : null
        );
      }
    };

    // Handle match events (timeline)
    const handleMatchEvent = (payload: any) => {
      if (payload.matchId === matchId) {
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                events: [payload, ...prev.events],
              }
            : null
        );
      }
    };

    // Handle statistics updates
    const handleStatsUpdate = (payload: any) => {
      if (payload.matchId === matchId) {
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                statistics: payload.statistics,
              }
            : null
        );
      }
    };

    // Handle status changes
    const handleStatusChange = (payload: any) => {
      if (payload.matchId === matchId) {
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                status: payload.status,
              }
            : null
        );
        setLocalMinute(payload.minute);
      }
    };

    socket.on(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
    socket.on(SOCKET_EVENTS.MATCH_EVENT, handleMatchEvent);
    socket.on(SOCKET_EVENTS.STATS_UPDATE, handleStatsUpdate);
    socket.on(SOCKET_EVENTS.STATUS_CHANGE, handleStatusChange);

    // Auto-increment minute for live matches
    const minuteInterval = setInterval(() => {
      setMatch((prev) => {
        if (
          prev &&
          (prev.status === 'FIRST_HALF' || prev.status === 'SECOND_HALF')
        ) {
          return { ...prev, minute: prev.minute + 1 };
        }
        return prev;
      });

      // Also increment local minute for display
      setMatch((prev) => {
        if (
          prev &&
          (prev.status === 'FIRST_HALF' || prev.status === 'SECOND_HALF')
        ) {
          setLocalMinute((m) => m + 1);
        }
        return prev;
      });
    }, 1000);

    return () => {
      socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_MATCH, { matchId });
      socket.off(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
      socket.off(SOCKET_EVENTS.MATCH_EVENT, handleMatchEvent);
      socket.off(SOCKET_EVENTS.STATS_UPDATE, handleStatsUpdate);
      socket.off(SOCKET_EVENTS.STATUS_CHANGE, handleStatusChange);
      clearInterval(minuteInterval);
    };
  }, [matchId, socket]);

  return {
    match,
    isLoading,
    error,
    localMinute,
    refetch: fetchDetail,
  };
}
