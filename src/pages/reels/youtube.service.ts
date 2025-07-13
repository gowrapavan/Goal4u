// src/services/youtube.service.ts
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyDtAPRzpdP8McGTtquC6NXjnmhE4Uhx9Eo';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeShort {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

// 🔥 Return ISO string of N days ago
const getRecentDate = (daysAgo = 14): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const fetchYouTubeShorts = async (
  query = 'football match highlights',
  pageToken?: string
): Promise<{ items: YouTubeShort[]; nextPageToken?: string }> => {
  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        key: YOUTUBE_API_KEY,
        q: query,
        part: 'snippet',
        maxResults: 15,
        type: 'video',
        videoDuration: 'short',
        order: 'date',
        pageToken,
        publishedAfter: getRecentDate(14), // ✅ Only show videos published in last 14 days
        safeSearch: 'none',
      },
    });

    return {
      items: response.data.items || [],
      nextPageToken: response.data.nextPageToken,
    };
  } catch (err) {
    console.error('YouTube Shorts Fetch Error:', err.message || err);
    return { items: [], nextPageToken: undefined };
  }
};
