const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const BASE_URL = "https://api.sportsdata.io/v4/soccer";

// Get full team list with IDs
async function getTeamsWithIds(competitionCode: string): Promise<{ TeamId: number }[]> {
  const url = `${BASE_URL}/scores/json/Teams/${competitionCode}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch teams for ${competitionCode}`);
  return await res.json(); // Each item has TeamId
}

// Map PlayerId → PhotoUrl for all players in that competition
export async function getPlayerHeadshotMapByCompetition(
  competitionCode: string
): Promise<Record<number, string>> {
  const teams = await getTeamsWithIds(competitionCode);
  const photoMap: Record<number, string> = {};

  const fetches = teams.map(async (team) => {
    const url = `${BASE_URL}/scores/json/PlayersByTeam/${competitionCode}/${team.TeamId}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return;

    const players = await res.json();
    players.forEach((player: any) => {
      if (player.PlayerId && player.PhotoUrl) {
        photoMap[player.PlayerId] = player.PhotoUrl;
      }
    });
  });

  await Promise.all(fetches);
  return photoMap;
}
