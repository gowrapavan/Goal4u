export const getTeamStatsById = async (competition, season, teamId) => {
  const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
  const BASE_URL = "https://api.sportsdata.io/v4/soccer/scores/json";
  const url = `${BASE_URL}/TeamSeasonStats/${competition}/${season}?key=${API_KEY}`;


  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error("❌ API Error:", data);
      throw new Error("Failed to fetch team stats");
    }

    // Handle nested structure: CWC, WC, etc.
    let allTeams = [];

    for (const round of data) {
      if (round.TeamSeasons && Array.isArray(round.TeamSeasons)) {
        allTeams.push(...round.TeamSeasons);
      }
    }

    const teamStats = allTeams.find(t => t.TeamId === parseInt(teamId));

    return teamStats || null;
  } catch (error) {
    console.error("Error fetching team stats:", error);
    throw error;
  }
};
