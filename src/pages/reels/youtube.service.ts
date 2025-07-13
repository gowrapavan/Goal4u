import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyCNqe4uWVgti_ZHBSI8_kKero_I6xf7qYk';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export const fetchYouTubeShorts = async (
  query = 'football match highlights',
  pageToken?: string,
  channelId?: string,
  extraParams: Record<string, string> = {} // ✅ supports additional params like order/viewCount etc.
): Promise<{ items: any[]; nextPageToken?: string }> => {
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
        publishedAfter: getRecentDate(14),
        ...(channelId ? { channelId } : {}),
        ...extraParams, // ✅ spread any custom overrides like 'order': 'viewCount'
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

const getRecentDate = (daysAgo = 14): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};
