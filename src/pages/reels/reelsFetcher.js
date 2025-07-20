// Group shorts by channel
const groupByChannel = (data) => {
  const groups = {};
  data.forEach(item => {
    const channel = item.channelName || 'Unknown';
    if (!groups[channel]) groups[channel] = [];
    groups[channel].push(item);
  });
  return Object.values(groups); // returns an array of arrays
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

    // Randomly pick one group that's not the same as the previous
    const lastChannel = result.length > 0 ? result[result.length - 1].channelName : null;
    const eligible = availableGroups.filter(({ group }) => group[0].channelName !== lastChannel);

    const pickFrom = eligible.length > 0 ? eligible : availableGroups;
    const { group, i } = pickFrom[Math.floor(Math.random() * pickFrom.length)];

    result.push(group[pointers[i]]);
    pointers[i]++;
  }

  return result;
};

// Store processed shorts and pointer
let allShuffledShorts = [];
let currentIndex = 0;
const BATCH_SIZE = 5;

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

// Fetch next batch
export const fetchNextReelsBatch = async () => {
  await loadShortsData();

  if (currentIndex >= allShuffledShorts.length) {
    return {
      newVideos: [],
      hasMore: false,
    };
  }

  const nextBatch = allShuffledShorts.slice(currentIndex, currentIndex + BATCH_SIZE).map((item, index) => ({
    id: `${item.videoId}-${Date.now()}-${currentIndex + index}`,
    type: 'youtube',
    src: item.embedUrl || `https://www.youtube.com/embed/${item.videoId}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0`,
    uploadDate: item.uploadDate || null,
    title: item.title || '',
    channelName: item.channelName || 'Unknown',
  }));

  currentIndex += BATCH_SIZE;

  return {
    newVideos: nextBatch,
    hasMore: currentIndex < allShuffledShorts.length,
  };
};
