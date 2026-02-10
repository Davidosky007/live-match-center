import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MatchStatus, EventType } from './types';

/**
 * Utility for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format relative time (e.g., "2m ago", "just now")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 10) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

/**
 * Format match start time (e.g., "Tomorrow · 6:30 PM")
 */
export function formatMatchTime(timestamp: string): string {
  const matchDate = new Date(timestamp);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = matchDate.toDateString() === now.toDateString();
  const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

  const timeStr = matchDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today · ${timeStr}`;
  if (isTomorrow) return `Tomorrow · ${timeStr}`;

  const dateStr = matchDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr} · ${timeStr}`;
}

/**
 * Get status badge text and styling
 */
export function getStatusBadge(status: MatchStatus, minute?: number) {
  switch (status) {
    case 'FIRST_HALF':
    case 'SECOND_HALF':
      return {
        text: 'Live',
        isLive: true,
        showMinute: true,
        variant: 'live' as const,
      };
    case 'HALF_TIME':
      return {
        text: 'Half Time',
        isLive: false,
        showMinute: false,
        variant: 'halftime' as const,
      };
    case 'FULL_TIME':
      return {
        text: 'Full Time',
        isLive: false,
        showMinute: false,
        variant: 'finished' as const,
      };
    case 'NOT_STARTED':
      return {
        text: 'Not Started',
        isLive: false,
        showMinute: false,
        variant: 'upcoming' as const,
      };
    default:
      return {
        text: 'Unknown',
        isLive: false,
        showMinute: false,
        variant: 'upcoming' as const,
      };
  }
}

/**
 * Get event icon emoji based on event type
 */
export function getEventIcon(type: EventType): string {
  switch (type) {
    case 'GOAL':
      return '⚽';
    case 'YELLOW_CARD':
      return '🟨';
    case 'RED_CARD':
      return '🟥';
    case 'SUBSTITUTION':
      return '🔄';
    case 'FOUL':
      return '⚠️';
    case 'SHOT':
      return '🎯';
    default:
      return '•';
  }
}

/**
 * Get event color class based on type
 */
export function getEventColorClass(type: EventType): string {
  switch (type) {
    case 'GOAL':
      return 'text-green-600 dark:text-green-400';
    case 'YELLOW_CARD':
      return 'text-yellow-card';
    case 'RED_CARD':
      return 'text-red-card';
    case 'SUBSTITUTION':
      return 'text-blue-600 dark:text-blue-400';
    case 'FOUL':
      return 'text-warn';
    case 'SHOT':
      return 'text-blue-500';
    default:
      return 'text-muted';
  }
}

/**
 * Validate username
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = username.trim();

  if (!trimmed) {
    return { valid: false, error: 'Username is required' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Username must be at least 2 characters' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' };
  }

  if (!/^[a-zA-Z0-9_\s]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Validate chat message
 */
export function validateChatMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = message.trim();

  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Message must be less than 500 characters' };
  }

  return { valid: true };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a random user ID
 */
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely parse JSON from localStorage
 */
export function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Group matches by status
 */
export function groupMatchesByStatus(matches: any[]) {
  const live = matches.filter(
    (m) => m.status === 'FIRST_HALF' || m.status === 'SECOND_HALF'
  );
  const upcoming = matches.filter((m) => m.status === 'NOT_STARTED');
  const recent = matches.filter(
    (m) => m.status === 'FULL_TIME' || m.status === 'HALF_TIME'
  );

  return { live, upcoming, recent };
}

/**
 * Format minute display (handles 45+ for added time)
 */
export function formatMinute(minute: number, status: MatchStatus): string {
  if (status === 'HALF_TIME') return 'HT';
  if (status === 'FULL_TIME') return 'FT';
  if (status === 'NOT_STARTED') return '';

  return `${minute}'`;
}
