'use client';

import { MatchEvent } from '@/lib/types';
import { TimelineEvent } from './TimelineEvent';

interface MatchTimelineProps {
  events: MatchEvent[];
}

export function MatchTimeline({ events }: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted">No events yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {events.map((event) => (
        <TimelineEvent
          key={event.id}
          event={event}
          isHomeTeamEvent={event.team === 'home'}
        />
      ))}
    </div>
  );
}
