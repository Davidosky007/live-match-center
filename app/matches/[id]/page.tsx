'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMatchDetail } from '@/hooks/useMatchDetail';
import { MatchHero } from '@/components/detail/MatchHero';
import { DetailTabBar } from '@/components/detail/DetailTabBar';
import { MatchTimeline } from '@/components/detail/MatchTimeline';
import { MatchStats } from '@/components/detail/MatchStats';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { UsernameModal } from '@/components/shared/UsernameModal';

type DetailTab = 'summary' | 'stats' | 'lineup' | 'table' | 'chat';

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

  const isMobile = true; // This should be responsive in a real app

  return (
    <div className="min-h-screen bg-bg pb-32 lg:pb-8">
      <UsernameModal />

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

      {/* Mobile Tab Bar */}
      <div className="lg:hidden mt-4 px-4">
        <div className="flex border-b border-border overflow-x-auto scrollbar-hide gap-4">
          {['Summary', 'Stats', 'Line up', 'Table', 'Chat'].map(
            (tab, idx) => {
              const tabKey = [
                'summary',
                'stats',
                'lineup',
                'table',
                'chat',
              ][idx] as DetailTab;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`
                    px-4 py-3 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors
                    border-b-2 -mb-px
                    ${
                      activeTab === tabKey
                        ? 'border-accent text-accent font-semibold'
                        : 'border-transparent text-muted hover:text-text-primary'
                    }
                  `}
                >
                  {tab}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Mobile Tab Content */}
      <div className="lg:hidden mt-4">
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
        {activeTab === 'chat' && <ChatPanel matchId={id} />}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-3 gap-4 p-4 mt-4">
        {/* Left: Detail tabs */}
        <div className="col-span-2">
          <DetailTabBar
            activeTab={activeTab as Exclude<DetailTab, 'chat'>}
            onTabChange={(tab) => setActiveTab(tab)}
          />
          <div className="mt-4">
            {activeTab === 'summary' && (
              <MatchTimeline events={match.events} />
            )}
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

        {/* Right: Chat panel */}
        <div className="col-span-1 border border-border rounded-lg overflow-hidden">
          <ChatPanel matchId={id} />
        </div>
      </div>
    </div>
  );
}
