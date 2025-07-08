import { Match, ApiMatch } from '../types/match';

// ✅ List of competitions
export const COMPETITIONS = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'NLC', name: 'Eredivisie', country: 'Netherlands' },
  { code: 'PTC', name: 'Primeira Liga', country: 'Portugal' },
  { code: 'MLS', name: 'Major League Soccer', country: 'USA' },
  { code: 'SPL', name: 'Scottish Premiership', country: 'Scotland' },
  { code: 'SKC', name: 'K League 1', country: 'South Korea' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
  { code: 'ELC', name: 'EFL Championship', country: 'England' },
  { code: 'UEL', name: 'UEFA Europa League', country: 'Europe' },
  { code: 'UNL', name: 'UEFA Nations League', country: 'Europe' },
  { code: 'UEQ', name: 'Euro Qualifiers', country: 'Europe' },
  { code: 'EFAC', name: 'FA Cup', country: 'England' },
  { code: 'SAWQ', name: 'South America World Cup Qualifiers', country: 'South America' },
  { code: 'ASWQ', name: 'Asia World Cup Qualifiers', country: 'Asia' },
  { code: 'AFWQ', name: 'Africa World Cup Qualifiers', country: 'Africa' },
  { code: 'NAWQ', name: 'North America World Cup Qualifiers', country: 'North America' },
  { code: 'OWQ', name: 'Oceania World Cup Qualifiers', country: 'Oceania' }
];

// ✅ Local file mapping
const LOCAL_JSON_FILES: Record<string, string> = {
  EPL: 'EPL.json',
  DEB: 'DEB.json',
  ITSA: 'ITSA.json',
  FRL1: 'FRL1.json',
  NLC: 'NLC.json',
  PTC: 'PTC.json',
  MLS: 'MLS.json',
  SPL: 'SPL.json',
  SKC: 'SKC.json',
  CWC: 'CWC.json',
  UCL: 'UCL.json',
  ELC: 'ELC.json',
  UEL: 'UEL.json',
  UNL: 'UNL.json',
  UEQ: 'UEQ.json',
  EFAC: 'EFAC.json',
  SAWQ: 'SAWQ.json',
  ASWQ: 'ASWQ.json',
  AFWQ: 'AFWQ.json',
  NAWQ: 'NAWQ.json',
  OWQ: 'OWQ.json',
};

// ✅ Local season folder (public/data/2026)
const SEASON = '2026';

/**
 * Transform raw API match to internal Match format
 */
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
 * Checks if a match is today or in the future
 */
function isTodayOrFuture(dateStr: string): boolean {
  const now = new Date();
  const matchDate = new Date(dateStr);

  return (
    matchDate.getFullYear() > now.getFullYear() ||
    (matchDate.getFullYear() === now.getFullYear() &&
      matchDate.getMonth() > now.getMonth()) ||
    (matchDate.getFullYear() === now.getFullYear() &&
      matchDate.getMonth() === now.getMonth() &&
      matchDate.getDate() >= now.getDate())
  );
}

/**
 * Fetch matches from all local competition files
 */
async function fetchLocalMatches(): Promise<Match[]> {
  const matchPromises: Promise<Match[]>[] = [];

  for (const comp of COMPETITIONS) {
    const fileName = LOCAL_JSON_FILES[comp.code];
    if (!fileName) continue;

    const url = `/data/${SEASON}/${fileName}`;

    const promise = fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then((data: ApiMatch[]) =>
        data
          .filter(match => match.Status === 'Scheduled' && isTodayOrFuture(match.DateTime))
          .map(match => transformApiMatch(match, comp.code))
      )
      .catch(() => []);

    matchPromises.push(promise);
  }

  const results = await Promise.all(matchPromises);
  return results.flat().sort(
    (a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
  );
}

/**
 * Return upcoming matches for selected clubs
 */
export async function getNextPreferredClubMatches(preferredClubs: string[], limit: number): Promise<Match[]> {
  const allMatches = await fetchLocalMatches();

  const filtered = allMatches.filter(
    match =>
      preferredClubs.includes(match.HomeTeamName || '') ||
      preferredClubs.includes(match.AwayTeamName || '')
  );

  return filtered.slice(0, limit);
}
