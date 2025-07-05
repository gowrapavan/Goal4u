export const getTeamById = async (competition: string, teamId: number) => {
  try {
    const filePath = `/data/teams/${competition.toLowerCase()}.json`;
    const res = await fetch(filePath);

    if (!res.ok) {
      throw new Error(`Teams file not found: ${filePath}`);
    }

    const teams = await res.json();
    const team = teams.find((t: any) => t.TeamId === teamId);
    if (!team) throw new Error(`Team ID ${teamId} not found in ${competition}`);
    return team;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch team profile.");
  }
};
