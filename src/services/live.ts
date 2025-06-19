// services/live.ts
import { Match, ApiMatch } from '../types/match';

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY; // ✅ Actual environment value
const BASE_URL = 'api/scores/json/ScoresBasic';

// Add or remove supported competitions here
const COMPETITIONS = [
  { code: 'EPL', name: 'Premier League' },
  { code: 'ESP', name: 'La Liga' },
  { code: 'GER', name: 'Bundesliga' },
  { code: 'ITA', name: 'Serie A' },
  { code: 'FRA', name: 'Ligue 1' },
  { code: 'UCL', name: 'UEFA Champions League' },
  { code: 'CWC', name: 'FIFA Club World Cup' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// Reuse transform logic from matchService
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

/**
 * Fetches today's live matches (status: InProgress, Break, or Halftime) from the top competitions.
 */
export async function getLiveMatches(): Promise<Match[]> {
  const today = formatDate(new Date());

  const fetchMatchesByCompetition = async (competition: string) => {
    const url = `${BASE_URL}/${competition}/${today}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch matches for ${competition}`);
    }

    const matches: ApiMatch[] = await response.json();

    return matches
      .filter(
        (match) =>
          match.Status === 'InProgress' ||
          match.Status === 'Break' ||
          match.Status === 'Halftime'
      )
      .map((match) => transformApiMatch(match, competition));
  };

  const results = await Promise.allSettled(
    COMPETITIONS.map((c) => fetchMatchesByCompetition(c.code))
  );

  const liveMatches: Match[] = results
    .filter((r): r is PromiseFulfilledResult<Match[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  return liveMatches.sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
}
