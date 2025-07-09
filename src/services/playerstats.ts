const API_KEY = import.meta.env.PlayerStatsApiKey;
const BASE_URL = "https://api.sportsdata.io/v4/soccer";

import { getPlayerHeadshotMapByCompetition } from "./playerheadshot";

export interface Player {
  PlayerId: number;
  Name: string;
  Team: string;
  Position: string;
  Goals: number;
  Competition: string;
  CompetitionName: string;
  TeamLogo?: string;
  PhotoUrl?: string;
}

const COMPETITIONS = [
  { code: "ESP", name: "La Liga" },
  { code: "EPL", name: "Premier League" },
  { code: "ITSA", name: "Serie A" },
  { code: "DEB", name: "Bundesliga" },
  { code: "FRL1", name: "Ligue 1" },
];

export async function getTeamsByCompetition(
  competitionCode: string
): Promise<Record<string, string>> {
  const url = `${BASE_URL}/scores/json/Teams/${competitionCode}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch teams for ${competitionCode}`);
  const data = await res.json();

  const teamLogoMap: Record<string, string> = {};
  data.forEach((team: any) => {
    teamLogoMap[team.Name] = team.WikipediaLogoUrl || "";
  });

  return teamLogoMap;
}

export async function getTopScorersFromCompetition(
  competition: string,
  season = "2025"
): Promise<Player[]> {
  const url = `${BASE_URL}/stats/json/PlayerSeasonStats/${competition}/${season}?key=${API_KEY}`;

  try {
    const [statsRes, logoMap, photoMap] = await Promise.all([
      fetch(url),
      getTeamsByCompetition(competition),
      getPlayerHeadshotMapByCompetition(competition),
    ]);

    if (!statsRes.ok) {
      console.warn(`API Error for ${competition}: ${statsRes.statusText}`);
      return [];
    }

    const data = await statsRes.json();
    if (!Array.isArray(data) || !data[0]?.PlayerSeasons) {
      console.warn(`Invalid API response structure for ${competition}`);
      return [];
    }

    const competitionName =
      COMPETITIONS.find((c) => c.code === competition)?.name || competition;

    return data[0].PlayerSeasons
      .filter((player: any) => player.Goals > 0)
      .map((player: any) => ({
        ...player,
        Competition: competition,
        CompetitionName: competitionName,
        TeamLogo: logoMap[player.Team] || "",
        PhotoUrl: photoMap[player.PlayerId] || "",
      }));
  } catch (error) {
    console.error(`Error fetching data for ${competition}:`, error);
    return [];
  }
}

export async function getTopScorersFromMultipleCompetitions(
  competitions: string[] = ["ESP", "EPL", "ITA", "GER", "FRA"],
  season = "2025"
): Promise<Player[]> {
  try {
    const promises = competitions.map((comp) =>
      getTopScorersFromCompetition(comp, season)
    );
    const results = await Promise.all(promises);
    const allPlayers = results.flat();

    return allPlayers.sort((a, b) => b.Goals - a.Goals);
  } catch (error) {
    console.error("Error fetching multi-competition data:", error);
    throw new Error("Failed to fetch top scorers from multiple competitions");
  }
}

export { COMPETITIONS };
