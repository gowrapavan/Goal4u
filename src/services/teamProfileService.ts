import axios from "axios";

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const BASE_URL = "https://api.sportsdata.io/v4/soccer/scores/json";

/**
 * Fetch full team profile by competition and teamId
 * @param competition - League code (e.g. "ESP", "EPL")
 * @param teamId - Team ID (e.g. 516)
 */
export const getTeamById = async (competition: string, teamId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/Teams/${competition}?key=${API_KEY}`);
    const allTeams = response.data;
    const team = allTeams.find((t: any) => t.TeamId === teamId);
    if (!team) throw new Error("Team not found");
    return team;
  } catch (error: any) {
    throw new Error(error?.response?.data || error.message || "Failed to fetch team profile.");
  }
};

/**
 * Fetch full squad by team
 * @param competition - League code (e.g. "ESP", "EPL")
 * @param teamId - Team ID (e.g. 516)
 */
export const getPlayersByTeam = async (competition: string, teamId: number) => {
  try {
    const url = `${BASE_URL}/PlayersByTeam/${competition}/${teamId}?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data || error.message || "Failed to fetch players.");
  }
};
