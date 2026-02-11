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
      className="block card-modern transition-smooth"
      role="article"
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* Header with league and favorite */}
      <div className="flex items-center justify-between mb-3 px-4 pt-4">
        <span className="text-xs font-bold text-accent uppercase tracking-wide">
          🏆 {match.homeTeam.name.split(' ')[0]}
        </span>
        <button
          onClick={(e) => e.preventDefault()}
          className="text-lg hover:scale-110 transition-transform duration-200"
          aria-label="Add to favorites"
        >
          ♡
        </button>
      </div>

      {/* Match Content */}
      <div className="flex items-center justify-between gap-6 my-6 px-4">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="team-crest w-10 h-10 mb-2 flex-shrink-0 text-lg">
            {match.homeTeam.shortName.charAt(0)}
          </div>
          <span className="text-xs font-bold text-text-primary text-center truncate">
            {match.homeTeam.shortName}
          </span>
        </div>

        {/* Score or VS */}
        <div className="flex flex-col items-center gap-2">
          {isUpcoming ? (
            <span className="text-sm font-bold text-muted">VS</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-text-primary animate-slideInLeft">
                {match.homeScore}
              </span>
              <span className="text-xl font-light text-muted">–</span>
              <span className="text-3xl font-extrabold text-text-primary animate-slideInRight">
                {match.awayScore}
              </span>
            </div>
          )}

          {/* Minute or Time */}
          <div className="text-xs font-bold text-accent">
            {isLive ? (
              <span className="bg-accent bg-opacity-20 px-2 py-1 rounded-full">
                {formatMinute(match.minute, match.status)}
              </span>
            ) : isUpcoming ? (
              <span className="text-xs text-muted">
                {formatMatchTime(match.startTime)}
              </span>
            ) : (
              <span className="text-muted">FT</span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="team-crest w-10 h-10 mb-2 flex-shrink-0 text-lg">
            {match.awayTeam.shortName.charAt(0)}
          </div>
          <span className="text-xs font-bold text-text-primary text-center truncate">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between pt-3 px-4 pb-4 border-t border-border">
        <MatchStatusBadge status={match.status} minute={match.minute} />
        <span className="text-xs text-accent font-bold transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
