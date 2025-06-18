import { useState, useEffect } from 'react';
import { sportsAPI } from '../services/api';

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

export function useApiWithParams<T, P>(
  apiCall: (params: P) => Promise<T>,
  params: P | null,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, ...dependencies]);

  return { data, loading, error };
}

// Predefined hooks
export function useUpcomingMatches(competition = 'EPL', count = 10) {
  return useApi(() => sportsAPI.getGamesByDate(competition, getToday()), [competition, count]);
}

export function useTeams(competition: string) {
  return useApi(() => sportsAPI.getTeams(competition), [competition]);
}

export function usePlayersByTeam(competition: string, teamId: number | null) {
  return useApi(() => {
    if (!teamId) return Promise.resolve([]);
    return sportsAPI.getPlayersByTeam(competition, teamId);
  }, [competition, teamId]);
}

export function useTopScorers(competitions: string[], season: string) {
  return useApi(async () => {
    const all = await Promise.all(
      competitions.map((comp) => sportsAPI.getTopScorers(comp, season))
    );
    const merged = all.flat().filter((p) => p.Goals && p.Goals > 0);
    return merged.sort((a, b) => b.Goals - a.Goals);
  }, [competitions.join(','), season]);
}



function getToday() {
  return new Date().toISOString().split('T')[0];
}
