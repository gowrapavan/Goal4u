export async function fetchBracketData() {
  try {
    const res = await fetch(
      "https://api.sportsdata.io/v4/soccer/scores/json/Schedule/cwc/2025?key=760bbc81e57a400e9aa8faf0205e663a"
    );
    const data = await res.json();

    const importantRounds = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"];
    const grouped: Record<string, { games: any[]; startDate: string | null; endDate: string | null }> = {};

    for (const item of data) {
      const roundName = item.Name?.trim();
      if (importantRounds.includes(roundName)) {
        const games = item.Games || [];
        const dateTimes = games.map((g: any) => new Date(g.DateTime).getTime());
        const startDate = dateTimes.length ? new Date(Math.min(...dateTimes)).toISOString() : null;
        const endDate = dateTimes.length ? new Date(Math.max(...dateTimes)).toISOString() : null;

        grouped[roundName] = {
          games,
          startDate,
          endDate,
        };
      }
    }

    return grouped;
  } catch (error) {
    console.error("[Bracket Service] Error fetching bracket data:", error);
    return null;
  }
}
