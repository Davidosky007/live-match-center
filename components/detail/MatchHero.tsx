'use client';

import { MatchDetail } from '@/lib/types';

interface MatchHeroProps {
  match: MatchDetail;
}

export function MatchHero({ match }: MatchHeroProps) {
  const isLive =
    match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';

  return (
    <div className="bg-hero-bg rounded-2xl mx-4 mt-4 p-8 shadow-lg">
      {/* Header: League logo and Live badge */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-8 h-8 team-crest flex-shrink-0 text-sm font-bold">
          🏆
        </div>
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-live bg-opacity-10 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-live animate-pulse" />
              <span className="text-sm font-bold text-live">● Live</span>
            </div>
          )}
          <button
            className="text-2xl hover:scale-110 transition-transform duration-200"
            aria-label="Add to favorites"
          >
            ♡
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3">
          <div className="team-crest w-16 h-16 flex-shrink-0 text-3xl font-bold shadow-md">
            {match.homeTeam.shortName.charAt(0)}
          </div>
          <p className="text-text-primary font-bold text-base">
            {match.homeTeam.shortName}
          </p>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="text-6xl font-black text-text-primary leading-none animate-slideInLeft">
              {match.homeScore}
            </span>
            <span className="text-4xl font-light text-muted mb-2">–</span>
            <span className="text-6xl font-black text-text-primary leading-none animate-slideInRight">
              {match.awayScore}
            </span>
          </div>

          {/* Minute Pill */}
          <div className="bg-surface text-text-primary text-sm font-extrabold px-4 py-1.5 rounded-full shadow-md border-2 border-accent border-opacity-30">
            {match.minute}&apos;
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3">
          <div className="team-crest w-16 h-16 flex-shrink-0 text-3xl font-bold shadow-md">
            {match.awayTeam.shortName.charAt(0)}
          </div>
          <p className="text-text-primary font-bold text-base">
            {match.awayTeam.shortName}
          </p>
        </div>
      </div>

      {/* Stadium */}
      <p className="text-sm text-muted text-center font-medium">🏟️ Emirates Stadium</p>
    </div>
  );
}
