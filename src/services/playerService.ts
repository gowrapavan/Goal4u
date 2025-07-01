// ✅ src/services/playerService.ts
import axios from 'axios';

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json';

export const getPlayersByTeam = async (competitionKey: string, teamId: number) => {
  const url = `${BASE_URL}/PlayersByTeam/${competitionKey}/${teamId}?key=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
};

export const getTeamsByCompetition = async (competitionKey: string = 'esp') => {
  const url = `${BASE_URL}/Teams/${competitionKey}?key=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
};

export const getAreas = async () => {
  const url = `${BASE_URL}/Areas?key=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
};

export const getCompetitions = async () => {
  const url = `${BASE_URL}/Competitions?key=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
};
