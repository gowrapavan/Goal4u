// netlify/functions/getNews.ts
import type { Handler } from '@netlify/functions';

const API_KEY = process.env.NEWSAPI_KEY;
const BASE_URL = 'https://newsapi.org/v2';

const PREFERRED_TAGS = [
  'Real Madrid',
  'Ronaldo',
  'Champions League',
  'Haaland',
  'FIFA',
  'Barcelona',
  'FIFA CLUB WORLD CUP',
  'ESPN',
];

const handler: Handler = async (event) => {
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing NEWSAPI_KEY environment variable' }),
    };
  }

  const { matchTitle = '', page = '1', pageSize = '8', preferred = 'false' } = event.queryStringParameters || {};

  // Build query
  let query = '';
  if (preferred === 'true') {
    query = PREFERRED_TAGS.join(' OR ');
  } else if (matchTitle) {
    query = matchTitle;
  }

  const endpoint = query ? '/everything' : '/top-headlines';

  const params = new URLSearchParams({
    apiKey: API_KEY,
    language: 'en',
    sortBy: 'publishedAt',
    page,
    pageSize,
    ...(query
      ? {
          q: query,
          searchIn: 'title,description',
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }
      : {
          category: 'sports',
          country: 'us',
        }),
  });

  const url = `${BASE_URL}${endpoint}?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.message || 'Failed to fetch news' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'NewsAPI fetch failed' }),
    };
  }
};

export { handler };
