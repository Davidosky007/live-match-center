'use client';

import { cn } from '@/lib/utils';

interface LeaguePillProps {
  leagues: { id: string; name: string }[];
  activeLeague: string;
  onLeagueChange: (leagueId: string) => void;
}

const DEFAULT_LEAGUES = [
  { id: 'all', name: 'All' },
  { id: 'pl', name: 'Premier League' },
  { id: 'la-liga', name: 'La Liga' },
  { id: 'serie-a', name: 'Serie A' },
  { id: 'bundesliga', name: 'Bundesliga' },
  { id: 'ligue-1', name: 'Ligue 1' },
];

export function LeaguePill({
  leagues = DEFAULT_LEAGUES,
  activeLeague,
  onLeagueChange,
}: LeaguePillProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
      role="tablist"
      aria-label="League filters"
    >
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => onLeagueChange(league.id)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0',
            activeLeague === league.id
              ? 'bg-accent text-accent-fg'
              : 'bg-surface-2 text-text-primary border border-border hover:bg-surface'
          )}
          role="tab"
          aria-selected={activeLeague === league.id}
          aria-label={`Filter by ${league.name}`}
        >
          {league.name}
        </button>
      ))}
    </div>
  );
}
