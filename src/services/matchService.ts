import { ApiMatch, Match, Competition } from '../types/match';
import { fetchBoxScoreById } from './boxscore'; // ✅ Add BoxScore import

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const isDev = import.meta.env.DEV;

const BASE_URL = isDev
  ? '/api/ScoresBasic'
  : 'https://api.sportsdata.io/v4/soccer/scores/json/ScoresBasic';

export const COMPETITIONS: Competition[] = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },         // ✅ corrected from 'ITA' → 'ITSA'
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },     // ✅ corrected from 'GER' → 'DEB'
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },        // ✅ corrected from 'FRA' → 'FRL1'
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

// ✅ Accurate score using BoxScore
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
  } catch {
    console.warn(`[BoxScore] Failed for ${comp}/${gameId}`);
    return null;
  }
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
            Promise.all(
              json.map(async (matchData) => {
                const match = transformApiMatch(matchData, comp.code);

                // 🧠 Only update score if it's a final match
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

    // 🧹 Deduplicate by GameId
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
