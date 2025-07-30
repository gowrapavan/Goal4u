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

// Interleave shorts to avoid consecutive same-channel videos
const interleaveShorts = (channelGroups) => {
  const result = [];
  const pointers = new Array(channelGroups.length).fill(0);

  while (true) {
    const availableGroups = channelGroups
      .map((group, i) => ({ group, i }))
      .filter(({ group, i }) => pointers[i] < group.length);

    if (availableGroups.length === 0) break;

    const lastChannel = result.length > 0 ? result[result.length - 1].channelName : null;
    const eligible = availableGroups.filter(({ group }) => group[pointers[group.length - 1]]?.channelName !== lastChannel);

    const pickFrom = eligible.length > 0 ? eligible : availableGroups;
    const { group, i } = pickFrom[Math.floor(Math.random() * pickFrom.length)];

    result.push(group[pointers[i]]);
    pointers[i]++;
  }

  return result;
};

// Core state
let allShuffledShorts = [];
let currentIndex = 0;
const BATCH_SIZE = 5;

let preloadedBatch = null;

// Load and prepare data
const loadShortsData = async () => {
  if (allShuffledShorts.length > 0) return;

  try {
    const res = await fetch('/shorts_data/shorts.json');
    if (!res.ok) throw new Error(`Failed to fetch shorts.json: ${res.status}`);
    const data = await res.json();

    const grouped = groupByChannel(data);
    allShuffledShorts = interleaveShorts(grouped);
  } catch (err) {
    console.error('❌ Error loading shorts.json:', err);
    allShuffledShorts = [];
  }
};

// Format a batch of videos
const formatBatch = (startIndex) => {
  return allShuffledShorts
    .slice(startIndex, startIndex + BATCH_SIZE)
    .map((item, index) => ({
      id: `${item.videoId}-${Date.now()}-${startIndex + index}`,
      type: 'youtube',
      src: item.embedUrl || `https://www.youtube.com/embed/${item.videoId}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0`,
      uploadDate: item.uploadDate || null,
      title: item.title || '',
      channelName: item.channelName || 'Unknown',
      channelLogo: item.channelLogo || '',
    }));
};

// Fetch next batch for UI to render
export const fetchNextReelsBatch = async () => {
  await loadShortsData();

  if (currentIndex >= allShuffledShorts.length) {
    return {
      newVideos: [],
      hasMore: false,
    };
  }

  const batch = preloadedBatch || formatBatch(currentIndex);
  currentIndex += BATCH_SIZE;
  preloadedBatch = null;

  return {
    newVideos: batch,
    hasMore: currentIndex < allShuffledShorts.length,
  };
};

// Preload next batch in background
export const prefetchNextReelsBatch = async () => {
  await loadShortsData();

  if (!preloadedBatch && currentIndex < allShuffledShorts.length) {
    preloadedBatch = formatBatch(currentIndex);
  }
};

// Check whether to preload more (to call inside component based on current position)
export const maybePrefetchMore = (currentVisibleIndex) => {
  const shouldPrefetch =
    currentVisibleIndex !== 0 &&
    (currentVisibleIndex + 1) % BATCH_SIZE === 3;

  if (shouldPrefetch) {
    prefetchNextReelsBatch();
  }
};
