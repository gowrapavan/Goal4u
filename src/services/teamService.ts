export const getTeamsByCompetition = async (competitionCode: string) => {
  try {
    const response = await fetch(`/data/teams/${competitionCode.toLowerCase()}.json`);
    if (!response.ok) {
      throw new Error(`File not found: ${competitionCode}.json`);
    }
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch teams.");
  }
};
