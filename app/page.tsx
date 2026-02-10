'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useMatchList } from '@/hooks/useMatchList';
import { MatchGrid } from '@/components/dashboard/MatchGrid';
import { LeaguePill } from '@/components/dashboard/LeaguePill';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function DashboardPage() {
  const { isConnected } = useSocket();
  const { matches, isLoading } = useMatchList();
  const [selectedLeague, setSelectedLeague] = useState('all');

  // Filter matches by selected league
  const filterMatches = () => {
    if (selectedLeague === 'all') return matches;
    // In a real app, matches would have a league property
    return matches;
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 bg-surface border-b border-border z-30">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">⚽ Football Hub</h1>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              aria-label={isConnected ? 'Connected' : 'Disconnected'}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <ThemeToggle />
          </div>
        </div>

        {/* League Filter Pills */}
        <LeaguePill
          leagues={[
            { id: 'all', name: 'All' },
            { id: 'pl', name: 'Premier League' },
            { id: 'la-liga', name: 'La Liga' },
            { id: 'serie-a', name: 'Serie A' },
          ]}
          activeLeague={selectedLeague}
          onLeagueChange={setSelectedLeague}
        />
      </header>

      {/* Main Content */}
      <main>
        <MatchGrid matches={filterMatches()} isLoading={isLoading} />
      </main>
    </div>
  );
}
