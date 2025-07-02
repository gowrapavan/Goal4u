import { useState, useEffect, useCallback } from 'react';

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
  query?: string; // fallback or override
}

export function useNews(
  page: number = 1,
  pageSize: number = 8,
  options: UseNewsOptions = {}
) {
  const [data, setData] = useState<NewsResult>({
    articles: [],
    totalResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;

  const { homeTeam, awayTeam, competition, query } = options;

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      // 🔥 Build smart keyword query
      const baseQuery = query?.trim()
        || `${homeTeam ?? ''} vs ${awayTeam ?? ''} ${competition ?? ''}`.trim();

      const encodedQuery = encodeURIComponent(baseQuery || 'football');

      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const url = `https://newsapi.org/v2/everything?q=${encodedQuery}&from=${fromDate}&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&searchIn=title,description&apiKey=${API_KEY}`;

      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();

      if (!res.ok || json.status !== 'ok') {
        throw new Error(json.message || 'Failed to fetch news');
      }

      setData((prev) => ({
        articles:
          page === 1
            ? json.articles
            : [...prev.articles, ...json.articles],
        totalResults: json.totalResults || 0,
      }));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(err.message || 'Failed to fetch news');
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [page, pageSize, API_KEY, query, homeTeam, awayTeam, competition]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    data,
    loading,
    error,
    refetch: fetchNews,
  };
}
