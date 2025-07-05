// services/teamlogo.ts

export interface Team {
  TeamId: number;
  Key: string;
  Name: string;
  WikipediaLogoUrl: string | null;
  [key: string]: any; // For other optional fields
}

const teamCache: Record<string, Team[]> = {}; // Cache teams per competition

/**
 * Fetch and cache team data for a competition from local JSON.
 * @param competition - League code (e.g., "EPL", "ESP")
 */
export async function fetchTeamsByCompetition(competition: string): Promise<Team[]> {
  const comp = competition.toLowerCase();
  const path = `/data/teams/${comp}.json`;

  console.log(`[teamlogo.ts] 🔄 Fetching teams from: ${path}`);

  if (teamCache[comp]) return teamCache[comp];

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`❌ Failed to fetch teams for ${competition}`);
    }

    const teams: Team[] = await response.json();
    teamCache[comp] = teams;
    return teams;
  } catch (err) {
    console.error(`[teamlogo.ts] ⚠️ Error loading teams for ${competition}:`, err);
    throw err;
  }
}

/**
 * Get logo URL for a team by its Key (e.g., "CFC") within a competition.
 * @param competition - League code (e.g., "EPL")
 * @param teamKey - Team short code (e.g., "ARS", "MNU")
 * @returns WikipediaLogoUrl or null
 */
export async function getTeamLogoByKey(competition: string, teamKey: string): Promise<string | null> {
  try {
    const teams = await fetchTeamsByCompetition(competition);
    const team = teams.find((t) => t.Key.toUpperCase() === teamKey.toUpperCase());

    if (!team) {
      console.warn(`[teamlogo.ts] 🕵️ Team with key "${teamKey}" not found in ${competition}`);
      return null;
    }

    return team.WikipediaLogoUrl || null;
  } catch (error) {
    console.warn(`[teamlogo.ts] ⚠️ Fallback to avatar for ${teamKey} in ${competition}`, error);
    return null;
  }
}
