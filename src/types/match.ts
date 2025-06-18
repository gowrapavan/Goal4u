// types/match.ts

export interface Match {
  GameId: number;
  HomeTeamName: string;
  AwayTeamName: string;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  DateTime: string;
  Status: string;
  IsClosed: boolean;
  Competition: string;
  AwayTeamCountryCode: string | null;
  HomeTeamCountryCode: string | null;
  Group?: string;
  Season: number;
  Winner?: string;
  HomeTeamKey: string;
  AwayTeamKey: string;
  Updated: string;
}

export interface ApiMatch {
  GameId: number;
  Season: number;
  Status: string;
  IsClosed: boolean;
  DateTime: string;
  Day: string;
  HomeTeamName: string;
  AwayTeamName: string;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  HomeTeamKey: string;
  AwayTeamKey: string;
  HomeTeamCountryCode: string | null;
  AwayTeamCountryCode: string | null;
  Group: string | null;
  Winner: string;
  Updated: string;
}

export interface Competition {
  code: string;
  name: string;
  country: string;
}
