/**
 * Fetch full team profile by competition and teamId from local JSON
 * @param competition - League code (e.g. "ESP", "EPL")
 * @param teamId - Team ID (e.g. 516)
 */
export const getTeamById = async (competition: string, teamId: number) => {
  try {
    const res = await fetch(`/data/teams/${competition.toLowerCase()}.json`);
    if (!res.ok) {
      throw new Error(`Failed to fetch teams for ${competition}`);
    }

    const teams = await res.json();
    const team = teams.find((t: any) => t.TeamId === teamId);

    if (!team) {
      throw new Error(`Team with ID ${teamId} not found in ${competition}`);
    }

    return team;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch team profile.");
  }
};

/**
 * Get the team `Key` (e.g. "BOR") by teamId from teams JSON
 * @param competition - League code (e.g. "EPL", "ESP")
 * @param teamId - Team ID (e.g. 508)
 */
const getTeamKeyById = async (competition: string, teamId: number): Promise<string> => {
  try {
    const res = await fetch(`/data/teams/${competition.toLowerCase()}.json`);
    if (!res.ok) {
      throw new Error(`Failed to fetch teams for ${competition}`);
    }

    const teams = await res.json();
    const team = teams.find((t: any) => t.TeamId === teamId);

    if (!team || !team.Key) {
      throw new Error(`Team key not found for ID ${teamId} in ${competition}`);
    }

    return team.Key.toLowerCase();
  } catch (error: any) {
    throw new Error(error.message || "Failed to retrieve team key.");
  }
};

/**
 * Fetch squad by team from local JSON.
 * Priority: /data/players/{comp}/{key}.json → fallback /data/players/{comp}_{id}.json
 * @param competition - League code (e.g. "ESP", "EPL")
 * @param teamId - Team ID (e.g. 559)
 */
export const getPlayersByTeam = async (competition: string, teamId: number) => {
  const comp = competition.toLowerCase();

  try {
    // First try with team key like `epl/bor.json`
    const key = await getTeamKeyById(comp, teamId);
    const pathByKey = `/data/players/${comp}/${key.toUpperCase()}.json`;
    console.log("Trying:", pathByKey);
    
    const resByKey = await fetch(pathByKey);
    if (resByKey.ok) {
      return await resByKey.json();
    }

    // Fallback: try e.g. `epl_508.json`
    const pathById = `/data/players/${comp}_${teamId}.json`;
    console.log("Fallback:", pathById);

    const resById = await fetch(pathById);
    if (resById.ok) {
      return await resById.json();
    }

    throw new Error(`Squad not found for ${competition} teamId ${teamId}`);
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch squad.");
  }
};
