'use client';

import Link from 'next/link';
import { Match } from '@/lib/types';
import { formatMatchTime, formatMinute } from '@/lib/utils';
import { MatchStatusBadge } from './MatchStatusBadge';

interface MatchCardProps {
  match: Match;
  onScoreFlash?: (element: HTMLElement) => void;
}

export function MatchCard({ match, onScoreFlash }: MatchCardProps) {
  const isLive =
    match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';
  const isUpcoming = match.status === 'NOT_STARTED';

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block bg-surface rounded-md p-4 shadow-card hover:shadow-lg hover:bg-surface-2 transition-all duration-200"
      role="article"
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* Header with league and favorite */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted">
          Premier League
        </span>
        <button
          onClick={(e) => e.preventDefault()}
          className="text-lg hover:text-live transition-colors"
          aria-label="Add to favorites"
        >
          🤍
        </button>
      </div>

      {/* Match Content */}
      <div className="flex items-center justify-between gap-4 my-4">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-surface-2 mb-2 flex-shrink-0" />
          <span className="text-xs font-semibold text-center truncate">
            {match.homeTeam.shortName}
          </span>
        </div>

        {/* Score or VS */}
        <div className="flex flex-col items-center gap-1">
          {isUpcoming ? (
            <span className="text-sm font-semibold text-muted">VS</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-text-primary">
                {match.homeScore}
              </span>
              <span className="text-lg font-light text-muted">–</span>
              <span className="text-2xl font-extrabold text-text-primary">
                {match.awayScore}
              </span>
            </div>
          )}

          {/* Minute or Time */}
          <div className="text-xs font-bold text-muted">
            {isLive ? (
              <span>{formatMinute(match.minute, match.status)}</span>
            ) : isUpcoming ? (
              <span className="text-xs text-muted">
                {formatMatchTime(match.startTime)}
              </span>
            ) : (
              <span>FT</span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-surface-2 mb-2 flex-shrink-0" />
          <span className="text-xs font-semibold text-center truncate">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <MatchStatusBadge status={match.status} minute={match.minute} />
        <span className="text-xs text-muted">→</span>
      </div>
    </Link>
  );
}
