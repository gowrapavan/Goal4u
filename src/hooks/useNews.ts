import { useState, useEffect } from 'react';
import { newsAPI, NewsArticle } from '../services/newsApi';

interface NewsResult {
  articles: NewsArticle[];
  totalResults: number;
}

const PREFERRED_TAGS = ['Real Madrid', 'Ronaldo', 'Champions League', 'Haaland', 'FIFA', 'Barcelona' , 'FIFA CLUB WORLD CUP' , 'ESPN'];

export function useNews(page: number = 1, pageSize: number = 8) {
  const [data, setData] = useState<NewsResult>({ articles: [], totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const preferredQuery = PREFERRED_TAGS.join(' OR ');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Try fetching preferred tag news
        const prefRes = await newsAPI.searchNews(preferredQuery, 'publishedAt', page, pageSize);
        const preferredArticles = newsAPI.filterArticles(prefRes.articles);

        if (preferredArticles.length > 0) {
          setData((prev) => ({
            articles: page === 1 ? preferredArticles : [...prev.articles, ...preferredArticles],
            totalResults: prefRes.totalResults,
          }));
          setUsedFallback(false);
        } else {
          // Step 2: Fallback to sports news
          const fallbackRes = await newsAPI.getSportsNews(page, pageSize);
          const fallbackArticles = newsAPI.filterArticles(fallbackRes.articles);
          setData((prev) => ({
            articles: page === 1 ? fallbackArticles : [...prev.articles, ...fallbackArticles],
            totalResults: fallbackRes.totalResults,
          }));
          setUsedFallback(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch news');
        console.error('NewsAPI error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [page, pageSize]);

  const refetch = async () => {
    setLoading(true);
    try {
      const prefRes = await newsAPI.searchNews(preferredQuery, 'publishedAt', 1, pageSize);
      const preferredArticles = newsAPI.filterArticles(prefRes.articles);

      if (preferredArticles.length > 0) {
        setData({ articles: preferredArticles, totalResults: prefRes.totalResults });
        setUsedFallback(false);
      } else {
        const fallbackRes = await newsAPI.getSportsNews(1, pageSize);
        const fallbackArticles = newsAPI.filterArticles(fallbackRes.articles);
        setData({ articles: fallbackArticles, totalResults: fallbackRes.totalResults });
        setUsedFallback(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    usedFallback, // optional: to show in UI if you want
  };
}
