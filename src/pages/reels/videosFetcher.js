// Group videos by channel
const groupByChannel = (data) => {
  const groups = {};
  data.forEach(item => {
    const channel = item.channelName || 'Unknown';
    if (!groups[channel]) groups[channel] = [];
    groups[channel].push(item);
  });
  return Object.values(groups); // array of grouped arrays
};

// Interleave videos to avoid same-channel repeats
const interleaveVideos = (channelGroups) => {
  const result = [];
  const pointers = new Array(channelGroups.length).fill(0);

  while (true) {
    const availableGroups = channelGroups
      .map((group, i) => ({ group, i }))
      .filter(({ group, i }) => pointers[i] < group.length);

    if (availableGroups.length === 0) break;

    const lastChannel = result.length > 0 ? result[result.length - 1].channelName : null;
    const eligible = availableGroups.filter(({ group }) => group[0].channelName !== lastChannel);

    const pickFrom = eligible.length > 0 ? eligible : availableGroups;
    const { group, i } = pickFrom[Math.floor(Math.random() * pickFrom.length)];

    result.push(group[pointers[i]]);
    pointers[i]++;
  }

  return result;
};

// Internal state
let allShuffledVideos = [];
let currentIndex = 0;
const BATCH_SIZE = 25;

// Load and prepare video data from JSON
const loadVideosData = async () => {
  if (allShuffledVideos.length > 0) return;

  try {
    const res = await fetch('/videos_data/videos.json'); // 📁 Adjust path if needed
    if (!res.ok) throw new Error(`Failed to fetch videos.json: ${res.status}`);
    const data = await res.json();

    const grouped = groupByChannel(data);
    allShuffledVideos = interleaveVideos(grouped);
  } catch (err) {
    console.error('❌ Error loading videos.json:', err);
    allShuffledVideos = [];
  }
};

// Main export: fetch next batch
export const fetchNextVideosBatch = async () => {
  await loadVideosData();

  if (currentIndex >= allShuffledVideos.length) {
    return {
      newVideos: [],
      hasMore: false,
    };
  }

 const nextBatch = allShuffledVideos
  .slice(currentIndex, currentIndex + BATCH_SIZE)
  .map((item, index) => ({
    id: `${item.videoId}-${Date.now()}-${currentIndex + index}`,
    type: 'youtube',
    src: item.embedUrl?.includes("autoplay=1")
      ? item.embedUrl
      : `https://www.youtube.com/embed/${item.videoId}?autoplay=1&controls=1&modestbranding=1`,
    uploadDate: item.uploadDate || null,
    title: item.title || '',
    channelName: item.channelName || 'Unknown',
    thumbnail: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
    channelLogo: item.channelLogo || '/default-avatar.png', // ✅ ADD THIS LINE
  }));


  currentIndex += BATCH_SIZE;

  return {
    newVideos: nextBatch,
    hasMore: currentIndex < allShuffledVideos.length,
  };
};
