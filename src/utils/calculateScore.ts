// utils/calculateScore.ts


const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/stats/json';

// utils/calculateScore.ts

export interface Goal {
  TeamId: number;
  Name: string;
  GameMinute: number;
  Type: 'Goal' | 'OwnGoal' | string;
}

/**
 * Calculate the actual score and goal breakdown for each team.
 * Handles own goals correctly.
 */
export function calculateScore(
  goals: Goal[] = [],
  homeTeamId: number,
  awayTeamId: number
): {
  homeScore: number;
  awayScore: number;
  homeGoals: Goal[];
  awayGoals: Goal[];
} {
  const homeGoals = goals.filter(
    (g) =>
      (g.Type === 'Goal' && g.TeamId === homeTeamId) ||
      (g.Type === 'OwnGoal' && g.TeamId === awayTeamId)
  );

  const awayGoals = goals.filter(
    (g) =>
      (g.Type === 'Goal' && g.TeamId === awayTeamId) ||
      (g.Type === 'OwnGoal' && g.TeamId === homeTeamId)
  );

  homeGoals.sort((a, b) => a.GameMinute - b.GameMinute);
  awayGoals.sort((a, b) => a.GameMinute - b.GameMinute);

  return {
    homeScore: homeGoals.length,
    awayScore: awayGoals.length,
    homeGoals,
    awayGoals,
  };
}
