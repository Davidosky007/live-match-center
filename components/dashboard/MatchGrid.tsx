'use client';

import { Match } from '@/lib/types';
import { groupMatchesByStatus } from '@/lib/utils';
import { MatchCard } from './MatchCard';
import { SectionHeader } from './SectionHeader';

interface MatchGridProps {
  matches: Match[];
  isLoading?: boolean;
}

export function MatchGrid({ matches, isLoading }: MatchGridProps) {
  const { live, upcoming, recent } = groupMatchesByStatus(matches);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-md p-4 h-24 skeleton"
            role="status"
            aria-label="Loading matches..."
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 lg:pb-8">
      {/* Live Matches */}
      {live.length > 0 && (
        <section>
          <SectionHeader title="Live Matches" count={live.length} />
          <div className="px-4 space-y-3">
            {live.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      {upcoming.length > 0 && (
        <section>
          <SectionHeader title="Upcoming Matches" count={upcoming.length} />
          <div className="px-4 space-y-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recent.length > 0 && (
        <section>
          <SectionHeader title="Recent Results" count={recent.length} />
          <div className="px-4 space-y-3">
            {recent.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted mb-2">No matches available</p>
          <p className="text-xs text-muted">
            Matches will appear here when they are scheduled
          </p>
        </div>
      )}
    </div>
  );
}
