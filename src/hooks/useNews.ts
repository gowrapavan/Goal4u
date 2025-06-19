import { useState, useEffect } from 'react';
import { NewsArticle } from '../services/newsApi';

interface NewsResult {
  articles: NewsArticle[];
  totalResults: number;
}

export function useNews(page: number = 1, pageSize: number = 8) {
  const [data, setData] = useState<NewsResult>({ articles: [], totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/.netlify/functions/getNews?page=${page}&pageSize=${pageSize}`);
        const json = await res.json();

        if (!json.articles || !Array.isArray(json.articles)) {
          throw new Error('Invalid news data');
        }

        setData((prev) => ({
          articles: page === 1 ? json.articles : [...prev.articles, ...json.articles],
          totalResults: json.totalResults || json.articles.length,
        }));
      } catch (err: any) {
        console.error('Failed to fetch news:', err);
        setError(err.message || 'News fetch failed');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [page, pageSize]);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/getNews?page=1&pageSize=${pageSize}`);
      const json = await res.json();

      setData({
        articles: json.articles || [],
        totalResults: json.totalResults || json.articles?.length || 0,
      });
    } catch (err: any) {
      console.error('Refetch failed:', err);
      setError(err.message || 'Failed to refetch news');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
