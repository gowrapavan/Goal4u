// netlify/functions/getNews.ts
import type { Handler } from '@netlify/functions';

const API_KEY = process.env.NEWSAPI_KEY;

const handler: Handler = async (event) => {
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=sports&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'NewsAPI fetch failed' }),
    };
  }
};

export { handler };
