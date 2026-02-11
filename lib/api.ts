import {
  Match,
  MatchDetail,
  APIResponse,
  MatchListResponse,
  MatchDetailResponse,
} from './types';


const BASE_URL = '/api';

/**
 * Fetch all matches
 */
export async function fetchMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE_URL}/matches`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch matches: ${res.status} ${res.statusText}`);
    }

    const body: APIResponse<MatchListResponse> = await res.json();

    if (!body.success) {
      throw new Error(body.message || 'Failed to fetch matches');
    }

    return body.data.matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

/**
 * Fetch live matches only
 */
export async function fetchLiveMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE_URL}/matches/live`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch live matches: ${res.status} ${res.statusText}`
      );
    }

    const body: APIResponse<MatchListResponse> = await res.json();

    if (!body.success) {
      throw new Error(body.message || 'Failed to fetch live matches');
    }

    return body.data.matches;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
}

/**
 * Fetch match detail by ID
 */
export async function fetchMatchDetail(id: string): Promise<MatchDetail> {
  try {
    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Match not found');
      }
      throw new Error(
        `Failed to fetch match detail: ${res.status} ${res.statusText}`
      );
    }

    const body: APIResponse<MatchDetailResponse> = await res.json();

    if (!body.success) {
      throw new Error(body.message || 'Failed to fetch match detail');
    }

    return body.data;
  } catch (error) {
    console.error('Error fetching match detail:', error);
    throw error;
  }
}

/**
 * Health check
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      cache: 'no-store',
    });
    return res.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
