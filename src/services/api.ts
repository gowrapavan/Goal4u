const API_KEY = import.meta.env.VITE_SPORTS_API_KEY; // ✅ Actual environment value
const BASE_URL = '/api';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

class SportsDataAPI {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async getCompetitions() {
    return this.request('/Competitions');
  }

  async getGamesByDate(competition: string, date: string) {
    return this.request(`/GamesByDate/${competition}/${date}`);
  }

  async getTeams(competition: string) {
    return this.request(`/Teams/${competition}`);
  }

  async getStandings(competition: string, season: string) {
    const standings = await this.request(`/Standings/${competition}/${season}`);
    const teamStandings = new Map();
    if (Array.isArray(standings)) {
      standings.forEach((entry: any) => {
        const teamKey = entry.TeamId || entry.Team;
        const existingEntry = teamStandings.get(teamKey);
        if (!existingEntry || (entry.Games > existingEntry.Games)) {
          teamStandings.set(teamKey, entry);
        }
      });
      return Array.from(teamStandings.values());
    }
    return standings;
  }

  async getTopScorers(competition: string, season: string) {
  return this.request(`/PlayerSeasonStats/${competition}/${season}`);
}


  async getTopScorersByCompetition(competition: string, season: string) {
  const response = await this.request<any[]>(`/PlayerSeasonStats/${competition}/${season}`);
  const playerStats = response?.[0]?.PlayerSeasons ?? [];

  // Filter only players with goals
  const scorers = playerStats.filter(p => p.Goals && p.Goals > 0);

  // Sort by most goals
  scorers.sort((a, b) => b.Goals - a.Goals);

  return scorers;
}

  async getPlayersByTeam(competition: string, teamId: number) {
    return this.request(`/PlayersByTeamBasic/${competition}/${teamId}`);
  }

  async getSchedule(competition: string, season: string) {
    return this.request(`/Schedule/${competition}/${season}`);
  }

  async getPlayerSeasonStats(competition: string, season: string) {
    return this.request(`/PlayerSeasonStats/${competition}/${season}`);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentSeason(): string {
    return new Date().getFullYear().toString();
  }
}

export const sportsAPI = new SportsDataAPI();
