export interface BoxScoreResponse {
  Game: {
    GameId: number;
    HomeTeamId: number;
    AwayTeamId: number;
    HomeTeamScore: number | null;
    AwayTeamScore: number | null;
  };
  Goals: {
    GoalId: number;
    TeamId: number;
    GameMinute: number;
    Name: string;
  }[];
}
