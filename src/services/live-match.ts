import axios from 'axios';
import { ApiMatch, Match, Competition } from '../types/match';

export const COMPETITIONS: Competition[] = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'MLS', name: 'Major League Soccer', country: 'USA' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

const GITHUB_BASE_URL =
  'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches';

function transformApiMatch(apiMatch: ApiMatch, competition: string): Match {
  return {
    GameId: apiMatch.GameId,
    HomeTeamName: apiMatch.HomeTeamName ?? apiMatch.HomeTeam,
    AwayTeamName: apiMatch.AwayTeamName ?? apiMatch.AwayTeam,
    HomeTeamScore: apiMatch.HomeTeamScore ?? null,
    AwayTeamScore: apiMatch.AwayTeamScore ?? null,
    DateTime: apiMatch.DateTime ?? apiMatch.Date,
    Status: apiMatch.Status ?? 'Scheduled',
    IsClosed: apiMatch.IsClosed ?? false,
    Competition: competition,
    AwayTeamCountryCode: apiMatch.AwayTeamCountryCode,
    HomeTeamCountryCode: apiMatch.HomeTeamCountryCode,
    Group: apiMatch.Group || undefined,
    Season: apiMatch.Season,
    Winner: apiMatch.Winner,
    HomeTeamKey: apiMatch.HomeTeamKey,
    AwayTeamKey: apiMatch.AwayTeamKey,
    Updated: apiMatch.Updated,
    HomeTeamLogo: apiMatch.HomeTeamLogo ?? null,
    AwayTeamLogo: apiMatch.AwayTeamLogo ?? null,
  };
}

// Format date as local YYYY-MM-DD
function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class LiveMatch {
  /**
   * Fetch all matches for a given date (ignores timezones)
   */
  static async fetchMatchesByDate(date: string): Promise<Match[]> {
    const results: Match[] = [];

    for (const comp of COMPETITIONS) {
      try {
        const url = `${GITHUB_BASE_URL}/${comp.code}.json`;
        const response = await axios.get<ApiMatch[]>(url);

        const transformed = response.data
          .filter((m) => {
            const matchDate = new Date(m.DateTime ?? m.Date);
            return formatDateLocal(matchDate) === date;
          })
          .map((m) => transformApiMatch(m, comp.code));

        results.push(...transformed);
      } catch (err: any) {
        console.error(`❌ Failed to load ${comp.code}:`, err.message || err);
      }
    }

    return results.sort(
      (a, b) => new Date(a.DateTime ?? '').getTime() - new Date(b.DateTime ?? '').getTime()
    );
  }

  /**
   * Fetch matches for the past `pastDays` and next `futureDays` days
   */
  static async fetchRecentMatches(pastDays = 7, futureDays = 7): Promise<Match[]> {
    const today = new Date();
    const dates: string[] = [];

    for (let i = -pastDays; i <= futureDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(formatDateLocal(d));
    }

    let allMatches: Match[] = [];
    for (const date of dates) {
      const matches = await this.fetchMatchesByDate(date);
      allMatches.push(...matches);
    }

    // Remove duplicates
    const seen = new Set<number>();
    const uniqueMatches = allMatches.filter((m) => {
      if (seen.has(m.GameId)) return false;
      seen.add(m.GameId);
      return true;
    });

    return uniqueMatches.sort(
      (a, b) => new Date(a.DateTime ?? '').getTime() - new Date(b.DateTime ?? '').getTime()
    );
  }

  /**
   * Fetch only today's live or scheduled matches
   */
  static async fetchLiveMatches(): Promise<Match[]> {
    const todayStr = formatDateLocal(new Date());
    const matches = await this.fetchMatchesByDate(todayStr);
    return matches
      .filter((m) => m.Status === 'InProgress' || m.Status === 'Scheduled')
      .sort((a, b) => new Date(a.DateTime ?? '').getTime() - new Date(b.DateTime ?? '').getTime());
  }
}




/*import { ApiMatch, Match, Competition } from '../types/match';
import { fetchBoxScoreById } from './boxscore'; // ⬅️ import full box score
const API_KEY = import.meta.env.VITE_SPORTSLIVE_API_KEY;
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json/ScoresBasic';

export const COMPETITIONS: Competition[] = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'MLS', name: 'Major League Soccer', country: 'USA' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

function transformApiMatch(apiMatch: ApiMatch, competition: string): Match {
  return {
    GameId: apiMatch.GameId,
    HomeTeamName: apiMatch.HomeTeamName,
    AwayTeamName: apiMatch.AwayTeamName,
    HomeTeamScore: apiMatch.HomeTeamScore,
    AwayTeamScore: apiMatch.AwayTeamScore,
    DateTime: apiMatch.DateTime,
    Status: apiMatch.Status,
    IsClosed: apiMatch.IsClosed,
    Competition: competition,
    AwayTeamCountryCode: apiMatch.AwayTeamCountryCode,
    HomeTeamCountryCode: apiMatch.HomeTeamCountryCode,
    Group: apiMatch.Group || undefined,
    Season: apiMatch.Season,
    Winner: apiMatch.Winner,
    HomeTeamKey: apiMatch.HomeTeamKey,
    AwayTeamKey: apiMatch.AwayTeamKey,
    Updated: apiMatch.Updated,
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ✅ Helper to calculate score from Goals array
async function getScoreFromBoxScore(comp: string, gameId: number): Promise<{ home: number; away: number } | null> {
  try {
    const boxScore = await fetchBoxScoreById(comp, gameId);
    const homeId = boxScore.Game.HomeTeamId;
    const awayId = boxScore.Game.AwayTeamId;

    const goals = boxScore.Goals || [];

    const homeGoals = goals.filter(
      g => (g.Type === 'Goal' && g.TeamId === homeId) || (g.Type === 'OwnGoal' && g.TeamId === awayId)
    );

    const awayGoals = goals.filter(
      g => (g.Type === 'Goal' && g.TeamId === awayId) || (g.Type === 'OwnGoal' && g.TeamId === homeId)
    );

    return {
      home: homeGoals.length,
      away: awayGoals.length
    };
  } catch (e) {
    console.warn(`[BoxScore] Failed to fetch for ${comp}/${gameId}`);
    return null;
  }
}

export class LiveMatch {
  static async fetchMatchesByDate(date: string): Promise<Match[]> {
    const results: Match[] = [];

    for (const comp of COMPETITIONS) {
      const url = `${BASE_URL}/${comp.code}/${date}?key=${API_KEY}`;

      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        const json: ApiMatch[] = await response.json();

        const transformed = await Promise.all(
          json.map(async (matchData) => {
            let match = transformApiMatch(matchData, comp.code);

            if (match.Status === 'Final') {
              const corrected = await getScoreFromBoxScore(comp.code, match.GameId);
              match.HomeTeamScore = corrected?.home ?? null;
              match.AwayTeamScore = corrected?.away ?? null;
            }

            return match;
          })
        );

        results.push(...transformed);
      } catch {
        continue;
      }
    }

    return results.sort(
      (a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
    );
  }

  static async fetchRecentMatches(days: number = 7): Promise<Match[]> {
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return formatDate(date);
    });

    const promises: Promise<Match[]>[] = [];

    for (const comp of COMPETITIONS) {
      for (const date of dates) {
        const url = `${BASE_URL}/${comp.code}/${date}?key=${API_KEY}`;
        const promise = fetch(url)
          .then((res) => (res.ok ? res.json() : []))
          .then((json: ApiMatch[]) =>
            Promise.all(
              json.map(async (matchData) => {
                let match = transformApiMatch(matchData, comp.code);
                if (match.Status === 'Final') {
                  const corrected = await getScoreFromBoxScore(comp.code, match.GameId);
                  match.HomeTeamScore = corrected?.home ?? null;
                  match.AwayTeamScore = corrected?.away ?? null;
                }
                return match;
              })
            )
          )
          .catch(() => []);
        promises.push(promise);
      }
    }

    const results = await Promise.all(promises);
    const flat = results.flat();

    const uniqueMatches: Match[] = [];
    const seenIds = new Set();

    for (const match of flat) {
      if (!seenIds.has(match.GameId)) {
        uniqueMatches.push(match);
        seenIds.add(match.GameId);
      }
    }

    return uniqueMatches.sort(
      (a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime()
    );
  }

  static async fetchLiveMatches(): Promise<Match[]> {
    const today = formatDate(new Date());
    const todayMatches = await this.fetchMatchesByDate(today);

    const now = new Date();
    return todayMatches.filter((match) => {
      const matchDate = new Date(match.DateTime);
      return (
        matchDate.getDate() === now.getDate() &&
        matchDate.getMonth() === now.getMonth() &&
        matchDate.getFullYear() === now.getFullYear() &&
        (match.Status === 'InProgress' || match.Status === 'Scheduled')
      );
    });
  }
}
*/