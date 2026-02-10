'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMatchDetail } from '@/hooks/useMatchDetail';
import { MatchHero } from '@/components/detail/MatchHero';
import { DetailTabBar } from '@/components/detail/DetailTabBar';
import { MatchTimeline } from '@/components/detail/MatchTimeline';
import { MatchStats } from '@/components/detail/MatchStats';

type DetailTab = 'summary' | 'stats' | 'lineup' | 'table';

interface MatchDetailPageProps {
  params: {
    id: string;
  };
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = params;
  const { match, isLoading, error } = useMatchDetail(id);
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-surface rounded-lg" />
          <div className="h-32 bg-surface rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Match Not Found</h1>
          <p className="text-muted mb-6">{error || 'This match could not be loaded'}</p>
          <Link
            href="/"
            className="inline-block bg-accent text-accent-fg px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-32 lg:pb-8">
      {/* Header with back button */}
      <header className="sticky top-0 bg-surface border-b border-border z-30 px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl hover:opacity-75 transition-opacity"
          aria-label="Back to matches"
        >
          ←
        </Link>
        <h1 className="text-sm font-semibold">
          {match.homeTeam.shortName} vs {match.awayTeam.shortName}
        </h1>
        <button className="text-2xl hover:opacity-75 transition-opacity">
          ↗
        </button>
      </header>

      {/* Hero Card */}
      <MatchHero match={match} />

      {/* Tab Bar */}
      <div className="mt-4 px-4">
        <DetailTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'summary' && <MatchTimeline events={match.events} />}
        {activeTab === 'stats' && <MatchStats stats={match.statistics} />}
        {activeTab === 'lineup' && (
          <div className="p-4 text-center text-muted">
            Lineup view coming soon
          </div>
        )}
        {activeTab === 'table' && (
          <div className="p-4 text-center text-muted">
            Table view coming soon
          </div>
        )}
      </div>
    </div>
  );
}
