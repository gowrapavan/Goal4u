// services/teamResultsService.ts
import { fetchBoxScoreById } from "./boxscore";

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const BASE_URL = "https://api.sportsdata.io/v4/soccer/scores/json/CompetitionDetails";

export interface MatchResult {
  GameId: number;
  DateTime: string;
  Status: string;
  HomeTeamId: number;
  AwayTeamId: number;
  HomeTeamKey: string;
  AwayTeamKey: string;
  HomeTeamName: string;
  AwayTeamName: string;
  Competition: string;
  HomeScore: number;
  AwayScore: number;
}

export const fetchTeamLastMatches = async (
  competition: string,
  teamId: number
): Promise<MatchResult[]> => {
  const url = `${BASE_URL}/${competition}?key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch competition matches");

  const data = await res.json();

  const matches = data.Games.filter(
    (game: any) =>
      (game.HomeTeamId === teamId || game.AwayTeamId === teamId) &&
      (game.Status === "Final" || game.IsClosed)
  )
    .sort((a: any, b: any) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime())
    .slice(0, 6);

  const corrected = await Promise.all(
    matches.map(async (match: any) => {
      let score = { home: match.HomeTeamScore ?? 0, away: match.AwayTeamScore ?? 0 };

      if (match.Status === "Final") {
        const box = await fetchBoxScoreById(competition, match.GameId).catch(() => null);
        if (box && box.Goals) {
          const homeId = box.Game.HomeTeamId;
          const awayId = box.Game.AwayTeamId;

          score = {
            home: box.Goals.filter(
              (g) =>
                (g.Type === "Goal" && g.TeamId === homeId) ||
                (g.Type === "OwnGoal" && g.TeamId === awayId)
            ).length,
            away: box.Goals.filter(
              (g) =>
                (g.Type === "Goal" && g.TeamId === awayId) ||
                (g.Type === "OwnGoal" && g.TeamId === homeId)
            ).length,
          };
        }
      }

      return {
        GameId: match.GameId,
        DateTime: match.DateTime,
        Status: match.Status,
        HomeTeamId: match.HomeTeamId,
        AwayTeamId: match.AwayTeamId,
        HomeTeamKey: match.HomeTeamKey,
        AwayTeamKey: match.AwayTeamKey,
        HomeTeamName: match.HomeTeamName,
        AwayTeamName: match.AwayTeamName,
        Competition: competition,
        HomeScore: score.home,
        AwayScore: score.away,
      };
    })
  );

  return corrected;
};
