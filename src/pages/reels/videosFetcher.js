let videosData = [];

const loadVideosData = async () => {
  const response = await fetch('https://raw.githubusercontent.com/gowrapavan/shortsdata/main/videos_data/videos.json');
  videosData = await response.json();
};

// Call this at the start of your app
(async () => {
  await loadVideosData();
})();

// Simulate API delay for realistic loading experience
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Common words to filter out from tags
const COMMON_WORDS = new Set([
  'highlights', 'video', 'official', 'hd', 'full', 'match', 'game', 'sport',
  'football', 'soccer', 'best', 'top', 'amazing', 'incredible', 'epic',
  'compilation', 'moments', 'skills', 'goals', 'vs', 'v', 'and', 'the',
  'of', 'in', 'at', 'on', 'for', 'with', 'by', 'from', 'to', 'a', 'an'
]);

// High-value tag categories that should be weighted more heavily
const HIGH_VALUE_TAGS = {
  // Player names (common patterns)
  players: ['messi', 'ronaldo', 'neymar', 'mbappe', 'haaland', 'benzema', 'lewandowski', 'salah', 'kane', 'modric'],
  // Team names
  teams: ['barcelona', 'real madrid', 'manchester united', 'liverpool', 'chelsea', 'arsenal', 'manchester city', 'tottenham', 'psg', 'bayern munich', 'juventus', 'ac milan', 'inter milan'],
  // Leagues
  leagues: ['premier league', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'champions league', 'europa league', 'world cup', 'euros'],
  // Content types
  content: ['analysis', 'tactical', 'interview', 'press conference', 'training', 'behind the scenes']
};

// Normalize and clean tags
const normalizeTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  
  return tags
    .map(tag => tag.toLowerCase().trim())
    .map(tag => tag.replace(/[^\w\s]/g, '')) // Remove punctuation
    .filter(tag => tag.length > 2) // Remove very short tags
    .filter(tag => !COMMON_WORDS.has(tag)) // Remove common words
    .map(tag => tag.replace(/\s+/g, ' ').trim()) // Normalize whitespace
    .filter(tag => tag.length > 0);
};

// Extract additional keywords from title and description
const extractKeywordsFromText = (text) => {
  if (!text) return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !COMMON_WORDS.has(word));
  
  // Look for high-value keywords in the text
  const keywords = [];
  
  // Check for player names, team names, etc.
  Object.values(HIGH_VALUE_TAGS).flat().forEach(valuableTag => {
    if (text.toLowerCase().includes(valuableTag)) {
      keywords.push(valuableTag);
    }
  });
  
  // Add other significant words (limit to avoid noise)
  keywords.push(...words.slice(0, 5));
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Build tag index for efficient lookup
const buildTagIndex = (videos) => {
  const tagIndex = new Map();
  
  videos.forEach(video => {
    // Get normalized tags
    const normalizedTags = normalizeTags(video.tags);
    
    // Extract additional keywords from title
    const titleKeywords = extractKeywordsFromText(video.title);
    
    // Combine tags and keywords
    const allTags = [...new Set([...normalizedTags, ...titleKeywords])];
    
    // Add video to each tag's list
    allTags.forEach(tag => {
      if (!tagIndex.has(tag)) {
        tagIndex.set(tag, []);
      }
      tagIndex.get(tag).push({
        ...video,
        normalizedTags: allTags
      });
    });
  });
  
  return tagIndex;
};

// Calculate tag weight based on category
const getTagWeight = (tag) => {
  // Check if tag belongs to high-value categories
  for (const [category, tags] of Object.entries(HIGH_VALUE_TAGS)) {
    if (tags.includes(tag)) {
      switch (category) {
        case 'players': return 3.0;
        case 'teams': return 2.5;
        case 'leagues': return 2.0;
        case 'content': return 1.5;
        default: return 1.0;
      }
    }
  }
  
  // Check for partial matches (e.g., "barcelona vs" contains "barcelona")
  for (const [category, tags] of Object.entries(HIGH_VALUE_TAGS)) {
    for (const valuableTag of tags) {
      if (tag.includes(valuableTag) || valuableTag.includes(tag)) {
        return category === 'players' ? 2.5 : category === 'teams' ? 2.0 : 1.5;
      }
    }
  }
  
  return 1.0; // Default weight
};

// Calculate similarity score between two videos
const calculateSimilarity = (video1, video2, tagIndex) => {
  const tags1 = video1.normalizedTags || normalizeTags(video1.tags);
  const tags2 = video2.normalizedTags || normalizeTags(video2.tags);
  
  if (tags1.length === 0 || tags2.length === 0) return 0;
  
  // Calculate weighted tag overlap
  let weightedOverlap = 0;
  let totalWeight1 = 0;
  let totalWeight2 = 0;
  
  const commonTags = tags1.filter(tag => tags2.includes(tag));
  
  commonTags.forEach(tag => {
    const weight = getTagWeight(tag);
    weightedOverlap += weight;
  });
  
  tags1.forEach(tag => {
    totalWeight1 += getTagWeight(tag);
  });
  
  tags2.forEach(tag => {
    totalWeight2 += getTagWeight(tag);
  });
  
  // Jaccard similarity with weights
  const union = totalWeight1 + totalWeight2 - weightedOverlap;
  const jaccardSimilarity = union > 0 ? weightedOverlap / union : 0;
  
  // Boost score for same channel (but less than tag similarity)
  const channelBoost = video1.channelName === video2.channelName ? 0.1 : 0;
  
  // Recency boost (newer videos get slight preference)
  const date1 = new Date(video1.uploadDate);
  const date2 = new Date(video2.uploadDate);
  const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
  const recencyBoost = daysDiff < 30 ? 0.05 : daysDiff < 90 ? 0.02 : 0;
  
  return jaccardSimilarity + channelBoost + recencyBoost;
};

// Get content-based recommendations for a video
const getContentBasedRecommendations = (currentVideo, allVideos, limit = 20) => {
  if (!currentVideo) return allVideos.slice(0, limit);
  
  // Build tag index
  const tagIndex = buildTagIndex(allVideos);
  
  // Get current video's normalized tags
  const currentTags = normalizeTags(currentVideo.tags);
  const currentKeywords = extractKeywordsFromText(currentVideo.title);
  const allCurrentTags = [...new Set([...currentTags, ...currentKeywords])];
  
  // Find candidate videos based on tag overlap
  const candidates = new Set();
  
  allCurrentTags.forEach(tag => {
    if (tagIndex.has(tag)) {
      tagIndex.get(tag).forEach(video => {
        if (video.videoId !== currentVideo.videoId) {
          candidates.add(video);
        }
      });
    }
  });
  
  // If no tag-based candidates, fall back to channel-based
  if (candidates.size === 0) {
    allVideos.forEach(video => {
      if (video.videoId !== currentVideo.videoId && 
          video.channelName === currentVideo.channelName) {
        candidates.add(video);
      }
    });
  }
  
  // If still no candidates, use random selection
  if (candidates.size === 0) {
    const randomVideos = allVideos
      .filter(v => v.videoId !== currentVideo.videoId)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
    return randomVideos;
  }
  
  // Calculate similarity scores
  const videosWithScores = Array.from(candidates).map(video => ({
    ...video,
    similarityScore: calculateSimilarity(
      { ...currentVideo, normalizedTags: allCurrentTags }, 
      video, 
      tagIndex
    )
  }));
  
  // Sort by similarity score (highest first)
  videosWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
  
  // Group by similarity levels for better distribution
  const highSimilarity = videosWithScores.filter(v => v.similarityScore > 0.4);
  const mediumSimilarity = videosWithScores.filter(v => v.similarityScore > 0.2 && v.similarityScore <= 0.4);
  const lowSimilarity = videosWithScores.filter(v => v.similarityScore <= 0.2);
  
  // Mix the results: prioritize high similarity but include variety
  const result = [];
  const maxHigh = Math.min(highSimilarity.length, Math.ceil(limit * 0.7));
  const maxMedium = Math.min(mediumSimilarity.length, Math.ceil(limit * 0.2));
  const maxLow = limit - maxHigh - maxMedium;
  
  result.push(...highSimilarity.slice(0, maxHigh));
  result.push(...mediumSimilarity.slice(0, maxMedium));
  result.push(...lowSimilarity.slice(0, maxLow));
  
  return result.slice(0, limit);
};

// Group videos by channel for diversity
const groupByChannel = (videos) => {
  const groups = {};
  videos.forEach(video => {
    const channel = video.channelName || 'Unknown';
    if (!groups[channel]) groups[channel] = [];
    groups[channel].push(video);
  });
  return Object.values(groups);
};

// Interleave videos to avoid same-channel clustering
const interleaveVideos = (channelGroups) => {
  const result = [];
  const pointers = new Array(channelGroups.length).fill(0);
  
  while (true) {
    const availableGroups = channelGroups
      .map((group, i) => ({ group, i }))
      .filter(({ group, i }) => pointers[i] < group.length);
    
    if (availableGroups.length === 0) break;
    
    // Avoid consecutive videos from same channel
    const lastChannel = result.length > 0 ? result[result.length - 1].channelName : null;
    const eligible = availableGroups.filter(({ group, i }) => 
      group[pointers[i]].channelName !== lastChannel
    );
    
    const pickFrom = eligible.length > 0 ? eligible : availableGroups;
    const { group, i } = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    
    result.push(group[pointers[i]]);
    pointers[i]++;
  }
  
  return result;
};

// Enhanced batch fetching with content-based recommendations
export const fetchNextVideosBatch = async (batchIndex = 0, batchSize = 10, currentVideo = null) => {
  // Simulate network delay
  await delay(300);
  
  let batch = [];
  
  if (currentVideo && (currentVideo.tags || currentVideo.title)) {
    // Get content-based recommendations
    const recommendedVideos = getContentBasedRecommendations(currentVideo, videosData, batchSize * 3);
    
    // Group by channel and interleave for diversity
    const channelGroups = groupByChannel(recommendedVideos);
    const interleavedVideos = interleaveVideos(channelGroups);
    
    // Take the requested batch size
    batch = interleavedVideos.slice(0, batchSize);
  } else {
    // Fallback to original logic for initial load
    const startIndex = (batchIndex * batchSize) % videosData.length;
    
    for (let i = 0; i < batchSize; i++) {
      const dataIndex = (startIndex + i) % videosData.length;
      batch.push(videosData[dataIndex]);
    }
  }
  
  // Transform videos to the expected format
  const transformedBatch = batch.map((video, i) => ({
    ...video,
    id: `${video.videoId}_${batchIndex}_${i}`,
    src: video.embedUrl,
    views: Math.floor(Math.random() * 1000000) + 10000,
    likes: Math.floor(Math.random() * 50000) + 1000,
  }));
  
  return {
    newVideos: transformedBatch,
    hasMore: true,
    nextBatchIndex: batchIndex + 1
  };
};

// Get related videos for sidebar and recommendations
export const getRelatedVideos = async (currentVideo, limit = 20) => {
  await delay(200);
  
  if (!currentVideo) {
    return videosData.slice(0, limit).map(video => ({
      ...video,
      id: video.videoId,
      src: video.embedUrl,
      views: Math.floor(Math.random() * 1000000) + 10000,
      likes: Math.floor(Math.random() * 50000) + 1000,
    }));
  }
  
  const relatedVideos = getContentBasedRecommendations(currentVideo, videosData, limit);
  
  return relatedVideos.map(video => ({
    ...video,
    id: video.videoId,
    src: video.embedUrl,
    views: Math.floor(Math.random() * 1000000) + 10000,
    likes: Math.floor(Math.random() * 50000) + 1000,
  }));
};

// Helper function to get a single video by ID
export const fetchVideoById = async (videoId) => {
  await delay(200);
  
  const video = videosData.find(v => v.videoId === videoId);
  if (!video) {
    throw new Error(`Video with ID ${videoId} not found`);
  }
  
  return {
    ...video,
    id: video.videoId,
    src: video.embedUrl,
    views: Math.floor(Math.random() * 1000000) + 10000,
    likes: Math.floor(Math.random() * 50000) + 1000,
  };
};

// Enhanced search with tag matching and content analysis
export const searchVideos = async (query, limit = 20) => {
  await delay(400);
  
  const queryLower = query.toLowerCase();
  const queryTags = normalizeTags([query]);
  
  // Score videos based on multiple criteria
  const scoredVideos = videosData.map(video => {
    let score = 0;
    
    // Title match (highest priority)
    if (video.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Channel name match
    if (video.channelName.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Tag matches with weights
    if (video.tags) {
      const normalizedVideoTags = normalizeTags(video.tags);
      queryTags.forEach(queryTag => {
        normalizedVideoTags.forEach(videoTag => {
          if (videoTag.includes(queryTag) || queryTag.includes(videoTag)) {
            const weight = getTagWeight(videoTag);
            score += weight * 3;
          }
        });
      });
    }
    
    // Exact tag matches get bonus
    if (video.tags) {
      const exactMatches = normalizeTags(video.tags).filter(tag => 
        tag === queryLower || queryLower.includes(tag)
      ).length;
      score += exactMatches * 5;
    }
    
    return { ...video, searchScore: score };
  });
  
  // Filter and sort by score
  const filteredVideos = scoredVideos
    .filter(video => video.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit);
  
  return {
    videos: filteredVideos.map(video => ({
      ...video,
      id: video.videoId,
      src: video.embedUrl,
      views: Math.floor(Math.random() * 1000000) + 10000,
      likes: Math.floor(Math.random() * 50000) + 1000,
    })),
    totalResults: filteredVideos.length
  };
};

// Get videos by specific tags with content-based expansion
export const getVideosByTags = async (tags, limit = 20) => {
  await delay(300);
  
  const normalizedInputTags = normalizeTags(tags);
  
  // Score videos based on tag matches
  const scoredVideos = videosData.map(video => {
    const videoTags = normalizeTags(video.tags);
    const titleKeywords = extractKeywordsFromText(video.title);
    const allVideoTags = [...videoTags, ...titleKeywords];
    
    let score = 0;
    
    normalizedInputTags.forEach(inputTag => {
      allVideoTags.forEach(videoTag => {
        if (videoTag === inputTag) {
          score += getTagWeight(videoTag) * 2; // Exact match
        } else if (videoTag.includes(inputTag) || inputTag.includes(videoTag)) {
          score += getTagWeight(videoTag); // Partial match
        }
      });
    });
    
    return { ...video, tagScore: score };
  });
  
  const matchingVideos = scoredVideos
    .filter(video => video.tagScore > 0)
    .sort((a, b) => b.tagScore - a.tagScore);
  
  return {
    videos: matchingVideos.slice(0, limit).map(video => ({
      ...video,
      id: video.videoId,
      src: video.embedUrl,
      views: Math.floor(Math.random() * 1000000) + 10000,
      likes: Math.floor(Math.random() * 50000) + 1000,
    })),
    totalResults: matchingVideos.length
  };
};

// Debug function to analyze tag distribution (useful for development)
export const analyzeTagDistribution = () => {
  const tagIndex = buildTagIndex(videosData);
  const tagStats = [];
  
  tagIndex.forEach((videos, tag) => {
    tagStats.push({
      tag,
      count: videos.length,
      weight: getTagWeight(tag),
      videos: videos.slice(0, 3).map(v => v.title) // Sample videos
    });
  });
  
  tagStats.sort((a, b) => b.count - a.count);
  
  console.log('Top 20 Tags:', tagStats.slice(0, 20));
  console.log('High-value Tags:', tagStats.filter(t => t.weight > 1.0));
  
  return tagStats;
};