const GITHUB_SHORTS_JSON = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/shorts_data/shorts.json';

// === Constants & Helpers ===
const WATCHED_KEY = 'watched_shorts';
const WATCHED_TIMESTAMP_KEY = 'watched_shorts_timestamp';
const RESET_INTERVAL_DAYS = 30;
const MAX_WATCHED_IDS = 10000;
const BATCH_SIZE = 5;

let allShuffledShorts = [];
let currentIndex = 0;
let preloadedBatch = null;

// Utility to get days between two dates
const getDaysBetween = (d1, d2) => {
  const diff = Math.abs(d2 - d1);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Reset if older than 30 days
const checkResetWatched = () => {
  const lastReset = localStorage.getItem(WATCHED_TIMESTAMP_KEY);
  const now = Date.now();

  if (!lastReset || getDaysBetween(Number(lastReset), now) >= RESET_INTERVAL_DAYS) {
    localStorage.removeItem(WATCHED_KEY);
    localStorage.setItem(WATCHED_TIMESTAMP_KEY, String(now));
  }
};

// Get watched shorts from localStorage
const getWatchedIds = () => {
  checkResetWatched();
  const stored = localStorage.getItem(WATCHED_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Mark shorts as watched
const markAsWatched = (ids) => {
  const current = new Set(getWatchedIds());
  ids.forEach(id => current.add(id));
  const updated = [...current];
  // Cap the list to 10,000 most recent
  const capped = updated.slice(-MAX_WATCHED_IDS);
  localStorage.setItem(WATCHED_KEY, JSON.stringify(capped));
};

// === Core Logic ===

// Find a specific video by videoId from all available data
export const findVideoById = async (targetVideoId) => {
  try {
    const res = await fetch(GITHUB_SHORTS_JSON);
    if (!res.ok) throw new Error(`Failed to fetch shorts.json: ${res.status}`);
    const data = await res.json();

    const validShorts = data.filter(
      item => item && item.videoId && item.embedUrl
    );

    const foundVideo = validShorts.find(item => item.videoId === targetVideoId);
    
    if (foundVideo) {
      return {
        id: `${foundVideo.videoId}-0`,
        videoId: foundVideo.videoId,
        type: 'youtube',
        src: foundVideo.embedUrl || `https://www.youtube.com/embed/${foundVideo.videoId}?enablejsapi=1&autoplay=0&controls=1`,
        uploadDate: foundVideo.uploadDate || null,
        title: foundVideo.title || '',
        channelName: foundVideo.channelName || 'Unknown',
        channelLogo: foundVideo.channelLogo || '',
        comments: Array.isArray(foundVideo.comments) ? foundVideo.comments : [],
        likeCount: foundVideo.likeCount || 0,
        viewCount: foundVideo.viewCount || 0,
        publishedAt: foundVideo.publishedAt || null,
        duration: foundVideo.duration || null,
      };
    }
    
    return null;
  } catch (err) {
    console.error('❌ Error finding video by ID:', err);
    return null;
  }
};

// Group shorts by channel
const groupByChannel = (data) => {
  const groups = {};
  data.forEach(item => {
    const channel = item.channelName || 'Unknown';
    if (!groups[channel]) groups[channel] = [];
    groups[channel].push(item);
  });
  return Object.values(groups);
};

// Interleave shorts to avoid same-channel repetition
const interleaveShorts = (channelGroups) => {
  const result = [];
  const pointers = new Array(channelGroups.length).fill(0);

  while (true) {
    const availableGroups = channelGroups
      .map((group, i) => ({ group, i }))
      .filter(({ group, i }) => pointers[i] < group.length);

    if (availableGroups.length === 0) break;

    const lastChannel = result.length > 0 ? result[result.length - 1].channelName : null;
    const eligible = availableGroups.filter(({ group, i }) =>
      group[pointers[i]]?.channelName !== lastChannel
    );

    const pickFrom = eligible.length > 0 ? eligible : availableGroups;
    const { group, i } = pickFrom[Math.floor(Math.random() * pickFrom.length)];

    result.push(group[pointers[i]]);
    pointers[i]++;
  }

  return result;
};

// Load and prepare data
const loadShortsData = async () => {
  if (allShuffledShorts.length > 0) return;

  try {
    const res = await fetch(GITHUB_SHORTS_JSON);
    if (!res.ok) throw new Error(`Failed to fetch shorts.json: ${res.status}`);
    const data = await res.json();

    // Only keep valid shorts with videoId and embedUrl
    const validShorts = data.filter(
      item => item && item.videoId && item.embedUrl
    );

    const grouped = groupByChannel(validShorts);
    const interleaved = interleaveShorts(grouped);

    const watchedIds = new Set(getWatchedIds());
    allShuffledShorts = interleaved.filter(item => !watchedIds.has(item.videoId));
  } catch (err) {
    console.error('❌ Error loading shorts.json:', err);
    allShuffledShorts = [];
  }
};

// Format a batch of videos
const formatBatch = (startIndex) =>
  allShuffledShorts
    .slice(startIndex, startIndex + BATCH_SIZE)
    .map((item, index) => ({
      id: `${item.videoId}-${startIndex + index}`,
      videoId: item.videoId,
      type: 'youtube',
      src: item.embedUrl || `https://www.youtube.com/embed/${item.videoId}?enablejsapi=1&autoplay=0&controls=1`,
      uploadDate: item.uploadDate || null,
      title: item.title || '',
      channelName: item.channelName || 'Unknown',
      channelLogo: item.channelLogo || '',
      comments: Array.isArray(item.comments) ? item.comments : [],
      likeCount: item.likeCount || 0,
      viewCount: item.viewCount || 0,
      publishedAt: item.publishedAt || null,
      duration: item.duration || null,
    }));

// Fetch next batch of reels
export const fetchNextReelsBatch = async () => {
  await loadShortsData();

  if (currentIndex >= allShuffledShorts.length) {
    return { newVideos: [], hasMore: false };
  }

  const batch = preloadedBatch || formatBatch(currentIndex);
  currentIndex += BATCH_SIZE;
  preloadedBatch = null;

  // ✅ Mark these as watched
  const watchedVideoIds = batch.map(video => video.id.split('-')[0]);
  markAsWatched(watchedVideoIds);

  return { newVideos: batch, hasMore: currentIndex < allShuffledShorts.length };
};

// Prefetch next batch (optional optimization)
export const prefetchNextReelsBatch = async () => {
  await loadShortsData();
  if (!preloadedBatch && currentIndex < allShuffledShorts.length) {
    preloadedBatch = formatBatch(currentIndex);
  }
};

// Preload conditionally based on scroll position
export const maybePrefetchMore = (currentVisibleIndex) => {
  const shouldPrefetch =
    currentVisibleIndex !== 0 && (currentVisibleIndex + 1) % BATCH_SIZE === 3;
  if (shouldPrefetch) {
    prefetchNextReelsBatch();
  }
};
