import { Match, ApiMatch } from '../types/match';

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const isDev = import.meta.env.DEV;

const BASE_URL = isDev
  ? '/api/ScoresBasic' // ✅ Dev uses Vite proxy
  : 'https://api.sportsdata.io/v4/soccer/scores/json/ScoresBasic'; // ✅ Live uses full path

export const COMPETITIONS = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

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

function getNextNDates(startOffset: number, numDays: number): string[] {
  const dates: string[] = [];
  const base = new Date();
  base.setDate(base.getDate() + startOffset);

  for (let i = 0; i < numDays; i++) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);
    dates.push(formatDate(date));
  }

  return dates;
}

async function fetchMatches(dates: string[]): Promise<Match[]> {
  const matchPromises: Promise<Match[]>[] = [];

  for (const comp of COMPETITIONS) {
    for (const date of dates) {
      const url = `${BASE_URL}/${comp.code}/${date}?key=${API_KEY}`;

      const fetchPromise = fetch(url)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: ApiMatch[]) =>
          data
            .filter((match) => match.Status === 'Scheduled')
            .map((match) => transformApiMatch(match, comp.code))
        )
        .catch(() => []); // fallback on failure

      matchPromises.push(fetchPromise);
    }
  }

  const results = await Promise.all(matchPromises);
  return results
    .flat()
    .sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
}

/**
 * Fetch live matches for today from all competitions.
 */
export async function getLiveMatches(): Promise<Match[]> {
  const today = formatDate(new Date());

  const promises = COMPETITIONS.map(async (comp) => {
    try {
      const url = `${BASE_URL}/${comp.code}/${today}?key=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data: ApiMatch[] = await res.json();
      return data
        .filter((m) =>
          ['InProgress', 'Break', 'Halftime'].includes(m.Status)
        )
        .map((match) => transformApiMatch(match, comp.code));
    } catch {
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat().sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
}

/**
 * Fetches the next upcoming match for any preferred club.
 */
export async function getNextPreferredClubMatch(preferredClubs: string[]): Promise<Match | null> {
  const searchRanges = [
    { start: 0, days: 7 },
    { start: 7, days: 7 },
    { start: 14, days: 16 }, // = 30 days total
  ];

  for (const range of searchRanges) {
    const dates = getNextNDates(range.start, range.days);
    const allMatches = await fetchMatches(dates);

    const filtered = allMatches.filter(
      (match) =>
        preferredClubs.includes(match.HomeTeamName) ||
        preferredClubs.includes(match.AwayTeamName)
    );

    if (filtered.length > 0) return filtered[0];
  }

  return null;
}
