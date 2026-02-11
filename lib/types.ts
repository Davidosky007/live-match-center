

export type MatchStatus =
  | 'NOT_STARTED'
  | 'FIRST_HALF'
  | 'HALF_TIME'
  | 'SECOND_HALF'
  | 'FULL_TIME';

export type EventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'FOUL'
  | 'SHOT';

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  minute: number;
  team: 'home' | 'away';
  player: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
}

export interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

export interface MatchDetail extends Match {
  events: MatchEvent[];
  statistics: MatchStatistics;
}

// Chat types

export interface ChatMessage {
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}

// Application state types

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnectedAt: Date | null;
}

export type AppTheme = 'light' | 'dark';

export interface User {
  userId: string;
  username: string;
}

// API response types

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface MatchListResponse {
  matches: Match[];
}

export interface MatchDetailResponse extends MatchDetail {}

// WebSocket event payloads

export interface ScoreUpdatePayload {
  matchId: string;
  homeScore: number;
  awayScore: number;
  minute: number;
}

export interface StatusChangePayload {
  matchId: string;
  status: MatchStatus;
  minute: number;
}

export interface MatchEventPayload extends MatchEvent {
  matchId: string;
}

export interface StatsUpdatePayload {
  matchId: string;
  statistics: MatchStatistics;
}

export interface ChatMessagePayload extends ChatMessage {}

export interface UserJoinedPayload {
  matchId: string;
  userId: string;
  username: string;
}

export interface UserLeftPayload {
  matchId: string;
  userId: string;
  username: string;
}

export interface TypingIndicatorPayload {
  matchId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}
