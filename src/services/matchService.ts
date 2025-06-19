// services/matchService.ts

import { ApiMatch, Match, Competition } from '../types/match';

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY; // ✅ Actual environment value
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json/ScoresBasic';

export const COMPETITIONS: Competition[] = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITA', name: 'Serie A', country: 'Italy' },
  { code: 'GER', name: 'Bundesliga', country: 'Germany' },
  { code: 'FRA', name: 'Ligue 1', country: 'France' },
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

export class MatchService {
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
          .then(res => res.ok ? res.json() : [])
          .then((json: ApiMatch[]) =>
            json.map((match) => transformApiMatch(match, comp.code))
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
}
