'use client';

import { MatchDetail } from '@/lib/types';

interface MatchHeroProps {
  match: MatchDetail;
}

export function MatchHero({ match }: MatchHeroProps) {
  const isLive =
    match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';

  return (
    <div className="bg-hero-bg rounded-lg mx-4 mt-4 p-6 shadow-card">
      {/* Header: League logo and Live badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-6 h-6 bg-surface-2 rounded-full" />
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-live">
              <div className="w-2 h-2 rounded-full bg-live animate-pulse-slow" />
              <span>● Live</span>
            </div>
          )}
          <button
            className="text-xl hover:opacity-75 transition-opacity"
            aria-label="Add to favorites"
          >
            ♡
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center gap-6 mb-6">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-surface rounded-full flex-shrink-0" />
          <p className="text-text-primary font-semibold text-sm">
            {match.homeTeam.shortName}
          </p>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-extrabold text-text-primary">
              {match.homeScore}
            </span>
            <span className="text-3xl font-light text-muted">–</span>
            <span className="text-5xl font-extrabold text-text-primary">
              {match.awayScore}
            </span>
          </div>

          {/* Minute Pill */}
          <div className="bg-surface text-text-primary text-sm font-bold px-3 py-0.5 rounded-full">
            {match.minute}&apos;
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-surface rounded-full flex-shrink-0" />
          <p className="text-text-primary font-semibold text-sm">
            {match.awayTeam.shortName}
          </p>
        </div>
      </div>

      {/* Stadium */}
      <p className="text-xs text-muted text-center">Emirates Stadium</p>
    </div>
  );
}
