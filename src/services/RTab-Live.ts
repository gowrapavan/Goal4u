import { Match } from '../types/match';
import { fetchBoxScoreById } from './boxscore';

const BASE_LOCAL = '/data/2026';

export const COMPETITIONS = [
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
];

interface JsonMatch {
  GameId: string;
  DateTime: string;
  Status: string;
  VenueType?: string;
  HomeTeamKey?: string;
  AwayTeamKey?: string;
  HomeTeamName?: string;
  AwayTeamName?: string;
  HomeTeamScore?: number;
  AwayTeamScore?: number;
  Result?: string;
}

function transformMatch(data: JsonMatch, competition: string): Match {
  return {
    GameId: data.GameId,
    DateTime: data.DateTime,
    Status: data.Status,
    VenueType: data.VenueType ?? 'Unknown',
    HomeTeamKey: data.HomeTeamKey ?? 'TBD',
    AwayTeamKey: data.AwayTeamKey ?? 'TBD',
    HomeTeamName: data.HomeTeamName ?? 'To Be Decided',
    AwayTeamName: data.AwayTeamName ?? 'To Be Decided',
    HomeTeamScore: data.HomeTeamScore,
    AwayTeamScore: data.AwayTeamScore,
    Competition: competition,
    IsClosed: data.Status === 'Final',
    Updated: new Date().toISOString(),
    Group: undefined,
    Season: undefined,
    Winner: data.Result ?? undefined,
    HomeTeamCountryCode: undefined,
    AwayTeamCountryCode: undefined,
  };
}

export async function getNextPreferredClubMatch(preferredClubs: string[]): Promise<Match | null> {
  const now = new Date().getTime();

  for (const comp of COMPETITIONS) {
    try {
      const res = await fetch(`${BASE_LOCAL}/${comp.code.toUpperCase()}.json`);
      const data: JsonMatch[] = await res.json();

      const upcoming = data
        .map(d => transformMatch(d, comp.code))
        .filter(m =>
          m.Status === 'Scheduled' &&
          new Date(m.DateTime).getTime() > now &&
          (
            preferredClubs.includes(m.HomeTeamName) ||
            preferredClubs.includes(m.AwayTeamName)
          )
        )
        .sort((a, b) =>
          new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
        )[0];

      if (upcoming) {
        return upcoming;
      }
    } catch (e) {
      console.error(`Failed loading ${comp.code}`, e);
    }
  }

  return null;
}
