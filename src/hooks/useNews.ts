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

export function useNews(page: number = 1, pageSize: number = 8) {
  const [data, setData] = useState<NewsResult>({ articles: [], totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const fetchNews = async (usePreferred: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/.netlify/functions/getNews?page=${page}&pageSize=${pageSize}&preferred=${usePreferred}`
      );
      const json = await res.json();

      if (res.ok && json.articles?.length > 0) {
        setData((prev) => ({
          articles: page === 1 ? json.articles : [...prev.articles, ...json.articles],
          totalResults: json.totalResults || 0,
        }));
        setUsedFallback(!usePreferred);
      } else if (usePreferred) {
        // fallback only if preferred failed
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
  }, [page, pageSize]);

  const refetch = () => {
    fetchNews(true);
  };

  return {
    data,
    loading,
    error,
    refetch,
    usedFallback,
  };
}
