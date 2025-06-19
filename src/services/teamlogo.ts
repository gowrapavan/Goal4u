export interface Team {
  TeamId: number;
  Key: string;
  Name: string;
  WikipediaLogoUrl: string | null;
  [key: string]: any; // For other optional fields
}

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY; // ✅ Actual environment value
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json/Teams';

const teamCache: Record<string, Team[]> = {}; // Cache teams per competition

/**
 * Fetch and cache team data for a competition.
 */
export async function fetchTeamsByCompetition(competition: string): Promise<Team[]> {
  if (teamCache[competition]) {
    return teamCache[competition];
  }

  try {
    const response = await fetch(`${BASE_URL}/${competition}?key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch teams for ${competition}`);
    }

    const teams: Team[] = await response.json();
    teamCache[competition] = teams;
    return teams;
  } catch (err) {
    console.error(`Error fetching teams for ${competition}:`, err);
    throw err;
  }
}

/**
 * Get logo URL for a team by key (e.g., "CFC") within a competition.
 */
export async function getTeamLogoByKey(competition: string, teamKey: string): Promise<string | null> {
  try {
    const teams = await fetchTeamsByCompetition(competition);
    const team = teams.find((t) => t.Key === teamKey);

    return team?.WikipediaLogoUrl || null;
  } catch (error) {
    console.warn(`Fallback to avatar for ${teamKey} in ${competition}`);
    return null;
  }
}
