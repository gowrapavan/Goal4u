// Utility to shuffle an array randomly
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// Store shuffled data and pointer across fetches
let allShuffledShorts = [];
let currentIndex = 0;
const BATCH_SIZE = 5;

// Load and shuffle data once
const loadShortsData = async () => {
  if (allShuffledShorts.length > 0) return;

  try {
    const res = await fetch('/shorts_data/shorts.json');
    if (!res.ok) throw new Error(`Failed to fetch shorts.json: ${res.status}`);
    const data = await res.json();
    allShuffledShorts = shuffleArray(data);
  } catch (err) {
    console.error('❌ Error loading shorts.json:', err);
    allShuffledShorts = [];
  }
};

// Get next batch of 5 shorts
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
  }));

  currentIndex += BATCH_SIZE;

  return {
    newVideos: nextBatch,
    hasMore: currentIndex < allShuffledShorts.length,
  };
};
