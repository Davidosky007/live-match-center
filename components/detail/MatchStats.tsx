'use client';

import { MatchStatistics } from '@/lib/types';

interface MatchStatsProps {
  stats: MatchStatistics;
}

export function MatchStats({ stats }: MatchStatsProps) {
  const statItems = [
    {
      label: 'Possession',
      homeValue: stats.possession.home,
      awayValue: stats.possession.away,
      unit: '%',
      showBars: true,
    },
    {
      label: 'Shots',
      homeValue: stats.shots.home,
      awayValue: stats.shots.away,
      showBars: true,
    },
    {
      label: 'Shots on Target',
      homeValue: stats.shotsOnTarget.home,
      awayValue: stats.shotsOnTarget.away,
      showBars: true,
    },
    {
      label: 'Corners',
      homeValue: stats.corners.home,
      awayValue: stats.corners.away,
      showBars: true,
    },
    {
      label: 'Fouls',
      homeValue: stats.fouls.home,
      awayValue: stats.fouls.away,
      showBars: false,
    },
    {
      label: 'Yellow Cards',
      homeValue: stats.yellowCards.home,
      awayValue: stats.yellowCards.away,
      showBars: false,
    },
    {
      label: 'Red Cards',
      homeValue: stats.redCards.home,
      awayValue: stats.redCards.away,
      showBars: false,
    },
  ];

  const maxValue = (stat: (typeof statItems)[0]) => {
    return Math.max(stat.homeValue, stat.awayValue);
  };

  return (
    <div className="p-4 space-y-6">
      {statItems.map((stat) => (
        <div key={stat.label}>
          {/* Values */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-text-primary w-8 text-left">
              {stat.homeValue}
              {stat.unit}
            </span>
            <span className="text-xs text-muted text-center flex-1">
              {stat.label}
            </span>
            <span className="font-bold text-text-primary w-8 text-right">
              {stat.awayValue}
              {stat.unit}
            </span>
          </div>

          {/* Bars */}
          {stat.showBars && (
            <div className="relative h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="absolute left-0 h-full bg-home-bar rounded-full transition-all"
                style={{
                  width: `${maxValue(stat) > 0 ? (stat.homeValue / maxValue(stat)) * 50 : 0}%`,
                }}
              />
              <div
                className="absolute right-0 h-full bg-away-bar rounded-full transition-all"
                style={{
                  width: `${maxValue(stat) > 0 ? (stat.awayValue / maxValue(stat)) * 50 : 0}%`,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
