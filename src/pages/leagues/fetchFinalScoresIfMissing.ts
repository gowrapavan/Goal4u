const API_KEY = import.meta.env.VITE_LeagueBox_API_KEY;
const BASE_URL = "https://api.sportsdata.io/v4/soccer/stats/json";
const TIME_OFFSET_HOURS = 5.5;
const MATCH_END_BUFFER_MINUTES = 120;

/** Type definition for one match item */
export interface Match {
  GameId: number;
  DateTime: string;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  HomeTeamKey: string;
  AwayTeamKey: string;
  Competition: string;
}

/**
 * Fetches BoxScoreFinal and extracts scores
 */
async function fetchBoxScoreFinal(competition: string, gameId: number): Promise<{ home: number, away: number }> {
  const url = `${BASE_URL}/BoxScoreFinal/${competition}/${gameId}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`BoxScoreFinal failed: ${res.status}`);

    const data = await res.json();
    const game = data?.[0]?.Game;
    if (!game) throw new Error(`Invalid BoxScore structure`);

    return {
      home: game.HomeTeamScore ?? 0,
      away: game.AwayTeamScore ?? 0,
    };
  } catch (err) {
    console.warn(`[BoxScore Fetch Error] ${competition}-${gameId}`, err);
    return { home: 0, away: 0 }; // fallback default
  }
}

/**
 * Given an array of matches, updates scores if:
 * - Score is missing (null)
 * - Match finished 2+ hours ago
 */
export async function fetchFinalScoresIfMissing(matches: Match[]): Promise<Match[]> {
  const now = Date.now();

  const updated = await Promise.all(
    matches.map(async (match) => {
      const matchTime = new Date(match.DateTime + "Z").getTime();
      const matchEnded = now > matchTime + MATCH_END_BUFFER_MINUTES * 60 * 1000;
      const scoreMissing = match.HomeTeamScore == null || match.AwayTeamScore == null;

      if (matchEnded && scoreMissing) {
        console.log(`[BoxScore] Fetching missing score: ${match.Competition} ${match.GameId}`);
        const { home, away } = await fetchBoxScoreFinal(match.Competition, match.GameId);

        return {
          ...match,
          HomeTeamScore: home,
          AwayTeamScore: away,
        };
      }

      return match; // leave untouched
    })
  );

  return updated;
}
