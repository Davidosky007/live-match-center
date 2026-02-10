'use client';

import { MatchEvent } from '@/lib/types';
import { formatRelativeTime, getEventIcon, getEventColorClass } from '@/lib/utils';

interface TimelineEventProps {
  event: MatchEvent;
  isHomeTeamEvent: boolean;
}

export function TimelineEvent({
  event,
  isHomeTeamEvent,
}: TimelineEventProps) {
  const alignment = isHomeTeamEvent ? 'flex-row' : 'flex-row-reverse';
  const textAlignment = isHomeTeamEvent ? 'text-left' : 'text-right';

  return (
    <div
      className={`flex ${alignment} items-start gap-3 py-3 px-4 border-b border-border hover:bg-surface-2 transition-colors`}
    >
      {/* Minute */}
      <span className={`text-xs font-bold text-muted w-8 flex-shrink-0 ${textAlignment}`}>
        {event.minute}'
      </span>

      {/* Icon */}
      <span
        className={`text-lg flex-shrink-0 ${getEventColorClass(event.type)}`}
        aria-hidden
      >
        {getEventIcon(event.type)}
      </span>

      {/* Content */}
      <div className={`flex-1 ${textAlignment}`}>
        <p className="text-sm font-semibold text-text-primary">
          {event.player}
          {event.assistPlayer && ` (${event.assistPlayer})`}
        </p>
        <p className="text-xs text-muted mt-0.5">{event.description}</p>
        <time className="text-xs text-muted block mt-1">
          {formatRelativeTime(event.timestamp)}
        </time>
      </div>
    </div>
  );
}
