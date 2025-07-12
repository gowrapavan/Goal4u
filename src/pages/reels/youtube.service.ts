// src/services/youtube.service.ts
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyAnyL18ylsE5Y6Q5h7VPm-xtjFKJOif3B8';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeShort {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

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
        maxResults: 15, // YouTube API limit is 50; 15 gives smooth performance
        type: 'video',
        videoDuration: 'short', // only shorts
        order: 'date',
        pageToken,
      },
    });

    return {
      items: response.data.items,
      nextPageToken: response.data.nextPageToken,
    };
  } catch (err) {
    console.error('YouTube Shorts Fetch Error:', err);
    return { items: [], nextPageToken: undefined };
  }
};
