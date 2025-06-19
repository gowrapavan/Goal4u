// services/teamlogo.ts

export interface Team {
  TeamId: number;
  Key: string;
  Name: string;
  WikipediaLogoUrl: string | null;
  [key: string]: any;
}

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY; // ✅ Actual environment value
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json/Teams';

let allTeams: Team[] | null = null;

/**
 * Fetch all teams once and cache.
 */
export async function fetchAllTeams(): Promise<Team[]> {
  if (allTeams) return allTeams;

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch all teams');

    allTeams = await res.json();
    return allTeams;
  } catch (err) {
    console.error('Error fetching all teams:', err);
    return [];
  }
}

/**
 * Find team logo by exact team name (e.g., "Chelsea").
 */
export async function getTeamLogoByName(teamName: string): Promise<string | null> {
  try {
    const teams = await fetchAllTeams();
    const team = teams.find(t => t.Name?.toLowerCase() === teamName.toLowerCase());

    return team?.WikipediaLogoUrl || null;
  } catch (err) {
    console.warn(`Could not find logo for ${teamName}`);
    return null;
  }
}
