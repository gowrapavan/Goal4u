// services/boxscore.ts

const API_KEY = import.meta.env.VITE_SPORTSBOX_API_KEY;
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/stats/json';

// ---------- Types ---------- //

export interface Game {
  GameId: number;
  DateTime: string;
  Status: string;
  Attendance: number;
  VenueId: number;
  HomeTeamName: string;
  AwayTeamName: string;
  HomeTeamKey: string;
  AwayTeamKey: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  HomeTeamFormation?: string;
  AwayTeamFormation?: string;
}

export interface Coach {
  CoachId: number;
  FirstName: string;
  LastName: string;
  ShortName: string;
  Nationality: string;
}

export interface Referee {
  RefereeId: number;
  FirstName: string;
  LastName: string;
  ShortName: string;
  Nationality: string;
}

export interface Lineup {
  LineupId: number;
  GameId: number;
  Type: 'Starter' | 'Substitute';
  TeamId: number;
  PlayerId: number;
  Name: string;
  Position: 'D' | 'M' | 'A' | 'GK';
  ReplacedPlayerId: number | null;
  ReplacedPlayerName: string | null;
  GameMinute: number;
  GameMinuteExtra: number;
  PitchPositionHorizontal: number;
  PitchPositionVertical: number;
}

export interface BoxScoreData {
  Game: Game;
  HomeTeamCoach: Coach;
  AwayTeamCoach: Coach;
  MainReferee: Referee;
  AssistantReferee1: Referee;
  AssistantReferee2: Referee;
  FourthReferee?: Referee;
  VideoAssistantReferee?: Referee;
  Lineups: Lineup[];
}

// ---------- Fetch Function ---------- //

export const fetchBoxScoreById = async (
  competition: string,
  gameId: number
): Promise<BoxScoreData> => {
  const url = `${BASE_URL}/BoxScoreFinal/${competition}/${gameId}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch BoxScoreFinal: ${response.status}`);
    }

    const data: BoxScoreData[] = await response.json();
    return data[0]; // API returns an array with one object
  } catch (error) {
    console.error('[BoxScore Error]', (error as Error).message);
    throw error;
  }
};
