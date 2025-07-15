// services/Leagues/laLigaService.ts
import axios from "axios";

export interface Match {
  GameId: number;
  Week: number;
  Date: string;
  DateTime?: string;
  HomeTeamName: string;
  AwayTeamName: string;
  Status: string;
}

export const fetchEPLMatchesByWeek = async (): Promise<Record<number, Match[]>> => {
  try {
    const response = await axios.get("/data/2026/EPL.json");
    const matches: Match[] = response.data;

    const grouped: Record<number, Match[]> = {};

    for (const match of matches) {
      if (!grouped[match.Week]) grouped[match.Week] = [];
      grouped[match.Week].push(match);
    }

    return grouped;
  } catch (error) {
    console.error("Error loading EPL data", error);
    return {};
  }
};
