'use client';

import { MatchStatus } from '@/lib/types';
import { getStatusBadge } from '@/lib/utils';

interface MatchStatusBadgeProps {
  status: MatchStatus;
  minute?: number;
}

export function MatchStatusBadge({ status, minute }: MatchStatusBadgeProps) {
  const badge = getStatusBadge(status, minute);

  if (badge.variant === 'live') {
    return (
      <div
        className="flex items-center gap-1.5 text-xs font-semibold text-live"
        aria-label={`Match is currently live at minute ${minute}`}
      >
        <div className="w-2 h-2 rounded-full bg-live animate-pulse-slow" aria-hidden />
        <span>● Live</span>
      </div>
    );
  }

  if (badge.variant === 'halftime') {
    return (
      <span className="text-xs font-semibold text-warn">⏸ Half Time</span>
    );
  }

  if (badge.variant === 'finished') {
    return (
      <span className="text-xs font-semibold text-muted">Full Time</span>
    );
  }

  return (
    <span className="text-xs font-semibold text-muted">Not Started</span>
  );
}
