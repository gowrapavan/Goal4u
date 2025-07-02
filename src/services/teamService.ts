import axios from "axios";

const API_BASE_URL = "https://api.sportsdata.io/v4/soccer/scores/json";
const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;

export const getTeamsByCompetition = async (competitionCode: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Teams/${competitionCode}`, {
      params: { key: API_KEY },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch teams.");
  }
};
