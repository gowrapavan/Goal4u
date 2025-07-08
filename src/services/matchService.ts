// services/matchService.ts
import { ApiMatch, Match, Competition } from '../types/match';
import { fetchBoxScoreById } from './boxscore';

export const COMPETITIONS: Competition[] = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

const LOCAL_BASE = '/data/2026/';
const FALLBACK_DAYS = [7, 10, 30];

// 👇 Time offset in hours to match your local time
const TIME_OFFSET_HOURS = 5.5;
const MATCH_DISPLAY_DELAY_MINUTES = 120; // Show match 2 hours after kickoff

function transformMatch(a: ApiMatch, comp: string): Match {
  return {
    GameId: a.GameId,
    HomeTeamName: a.HomeTeamName,
    AwayTeamName: a.AwayTeamName,
    HomeTeamScore: a.HomeTeamScore ?? null,
    AwayTeamScore: a.AwayTeamScore ?? null,
    DateTime: a.DateTime,
    Status: a.Status,
    IsClosed: a.IsClosed,
    Competition: comp,
    AwayTeamCountryCode: a.AwayTeamCountryCode,
    HomeTeamCountryCode: a.HomeTeamCountryCode,
    Group: a.Group || undefined,
    Season: a.Season,
    Winner: a.Winner,
    HomeTeamKey: a.HomeTeamKey,
    AwayTeamKey: a.AwayTeamKey,
    Updated: a.Updated
  };
}

// ✅ Shift time and format for display
export function formatMatchTime(rawDateTime: string): string {
  const original = new Date(rawDateTime);
  const shifted = new Date(original.getTime() + TIME_OFFSET_HOURS * 60 * 60 * 1000);

  const now = new Date();
  const isToday =
    shifted.getDate() === now.getDate() &&
    shifted.getMonth() === now.getMonth() &&
    shifted.getFullYear() === now.getFullYear();

  const timeStr = shifted.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const label = isToday
    ? 'Today'
    : shifted.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return `${label}, ${timeStr}`;
}

// 🔄 Fallback scoring from API
export async function getScoreFromBoxScore(match: Match): Promise<{ homeScore: number | null, awayScore: number | null }> {
  try {
    const box = await fetchBoxScoreById(match.Competition, match.GameId);
    const home = box.Goals.filter(g => g.TeamId === box.Game.HomeTeamId && g.Type === 'Goal').length;
    const away = box.Goals.filter(g => g.TeamId === box.Game.AwayTeamId && g.Type === 'Goal').length;
    return { homeScore: home, awayScore: away };
  } catch (err) {
    console.warn('[BoxScore Error]', err);
    return { homeScore: 0, awayScore: 0 }; // ✅ fallback default score
  }
}

// ✅ MAIN MATCH SERVICE
export class MatchService {
  static async fetchRecentMatches(limit = 4): Promise<Match[]> {
    const now = Date.now();
    let allMatches: Match[] = [];

    for (const days of FALLBACK_DAYS) {
      const cutoff = now - days * 86400000;
      const found: Match[] = [];

      for (const comp of COMPETITIONS) {
        try {
          const res = await fetch(`${LOCAL_BASE}${comp.code}.json`);
          if (!res.ok) continue;

          const json: ApiMatch[] = await res.json();

          const filtered = json
            .map(m => transformMatch(m, comp.code))
            .filter(m => {
              const matchTime = new Date(m.DateTime).getTime() + TIME_OFFSET_HOURS * 60 * 60 * 1000;
              const showTime = matchTime + MATCH_DISPLAY_DELAY_MINUTES * 60 * 1000;
              return showTime < now && matchTime >= cutoff;
            });

          found.push(...filtered);
        } catch (err) {
          console.warn(`[Fetch Fail] ${comp.code}.json`, err);
        }
      }

      if (found.length > 0) {
        allMatches = found;
        break;
      }
    }

    // Deduplicate
    const uniqueMap = new Map<number, Match>();
    for (const m of allMatches) {
      if (!uniqueMap.has(m.GameId)) {
        uniqueMap.set(m.GameId, m);
      }
    }

    const finalMatches = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime())
      .slice(0, limit);

    await Promise.all(
      finalMatches.map(async (match) => {
        if (match.HomeTeamScore === null || match.AwayTeamScore === null) {
          const score = await getScoreFromBoxScore(match);
          match.HomeTeamScore = score.homeScore;
          match.AwayTeamScore = score.awayScore;
        }
      })
    );

    return finalMatches;
  }
}
