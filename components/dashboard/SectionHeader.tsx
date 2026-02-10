'use client';

import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  onSeeAll?: () => void;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  count,
  onSeeAll,
}: SectionHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center w-6 h-6 bg-live text-white text-xs rounded-full font-bold">
            {count}
          </span>
        )}
      </div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-sm text-accent font-medium hover:opacity-75 transition-opacity"
        >
          See all ›
        </button>
      )}
    </div>
  );
}
