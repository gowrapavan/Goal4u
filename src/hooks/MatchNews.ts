import { useState, useEffect } from 'react';

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResult {
  articles: NewsArticle[];
  totalResults: number;
}

interface UseNewsOptions {
  homeTeam?: string;
  awayTeam?: string;
  competition?: string;
  query?: string; // custom override
}

const PREFERRED_TAGS = [
  'Real Madrid', 'Ronaldo', 'Champions League',
  'Haaland', 'FIFA', 'Barcelona', 'FIFA CLUB WORLD CUP', 'ESPN'
];

export function useNews(
  page: number = 1,
  pageSize: number = 8,
  options: UseNewsOptions = {}
) {
  const [data, setData] = useState<NewsResult>({ articles: [], totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const { query, homeTeam, awayTeam, competition } = options;

  const buildQuery = () => {
    return (
      query?.trim() ||
      `${homeTeam ?? ''} vs ${awayTeam ?? ''} ${competition ?? ''}`.trim() ||
      ''
    );
  };

  const fetchNews = async (usePreferred: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const searchQuery = usePreferred ? PREFERRED_TAGS.join(',') : buildQuery();
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const res = await fetch(
        `/.netlify/functions/getNews?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(
          searchQuery || 'football'
        )}&from=${fromDate}&preferred=${usePreferred}`
      );

      const json = await res.json();

      if (res.ok && json.articles?.length > 0) {
        setData((prev) => ({
          articles: page === 1 ? json.articles : [...prev.articles, ...json.articles],
          totalResults: json.totalResults || 0,
        }));
        setUsedFallback(!usePreferred);
      } else if (usePreferred) {
        // fallback to preferred only once
        fetchNews(false);
      } else {
        throw new Error(json.error || 'No articles found');
      }
    } catch (err: any) {
      console.error('useNews error:', err);
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(true);
  }, [page, pageSize, query, homeTeam, awayTeam, competition]);

  const refetch = () => {
    fetchNews(true);
  };

  return {
    data,
    loading,
    error,
    usedFallback,
    refetch,
  };
}
