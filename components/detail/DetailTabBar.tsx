'use client';

import { useState } from 'react';

type DetailTab = 'summary' | 'stats' | 'lineup' | 'table';

interface DetailTabBarProps {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'stats', label: 'Stats' },
  { id: 'lineup', label: 'Line up' },
  { id: 'table', label: 'Table' },
];

export function DetailTabBar({ activeTab, onTabChange }: DetailTabBarProps) {
  return (
    <div
      className="flex border-b border-border overflow-x-auto scrollbar-hide"
      role="tablist"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-3 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors
            border-b-2 -mb-px
            ${
              activeTab === tab.id
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted hover:text-text-primary'
            }
          `}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
