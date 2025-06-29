// hooks/useNews-test.ts
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

export function useNews(page: number = 1, pageSize: number = 8) {
  const [data, setData] = useState<NewsResult>({ articles: [], totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const keywords = [
        'Real Madrid',
        'Barcelona',
        'UEFA',
        'Champions League',
        'FIFA',
        'Bundesliga',
        'Premier League',
        'Serie A',
        'La Liga',
        'EURO 2024',
        'Ronaldo',
        'Haaland',
        'Mbappe',
        'Manchester City',
        'ESPN',
        'Sky Sports',
        'BBC Sport'
      ].join(' OR ');

      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        keywords
      )}&from=${fromDate}&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&searchIn=title,description&apiKey=${API_KEY}`;

      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();

      if (!res.ok || json.status !== 'ok') {
        throw new Error(json.message || 'Failed to fetch news');
      }

      setData((prev) => ({
        articles: page === 1 ? json.articles : [...prev.articles, ...json.articles],
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
  }, [page, pageSize, API_KEY]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const refetch = () => {
    fetchNews();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
