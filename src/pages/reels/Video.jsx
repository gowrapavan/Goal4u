import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchNextVideosBatch } from './videosFetcher';
import CommentPopup from './CommentPopup';
import ShareButton from './ShareButton';
import './video.css';

const truncate = (str, max = 60) =>
  str.length > max ? str.slice(0, max).trim() + '…' : str;

const formatDate = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTimeAgo = (isoDate) => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

const Video = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  const [batchIndex, setBatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);

  useEffect(() => {
    const loadInitialBatch = async () => {
      setLoading(true);
      
      // If no videoId in URL, redirect to home
      if (!videoId) {
        navigate('/', { replace: true });
        return;
      }
      
      // Load initial batch for video recommendations
      const batch1 = await fetchNextVideosBatch(0, 12, null);
      const batch2 = await fetchNextVideosBatch(1, 12, null);
      const batch3 = await fetchNextVideosBatch(2, 12, null);
      
      const allVideos = [...batch1.newVideos, ...batch2.newVideos, ...batch3.newVideos];
      setVideos(allVideos);
      
      // Find and set the video based on videoId
      const foundVideo = allVideos.find(v => v.videoId === videoId);
      if (foundVideo) {
        setMainVideo(foundVideo);
        
        // Load content-based recommendations for this specific video
        const { newVideos: recommendedVideos } = await fetchNextVideosBatch(0, 20, foundVideo);
        setVideos(prev => {
          // Merge recommendations with existing videos, avoiding duplicates
          const existingIds = new Set(prev.map(v => v.videoId));
          const newRecommendations = recommendedVideos.filter(v => !existingIds.has(v.videoId));
          return [...prev, ...newRecommendations];
        });
      } else {
        // If video not found, default to first video and update URL
        setMainVideo(allVideos[0]);
        navigate(`/videos/${allVideos[0].videoId}`, { replace: true });
      }
      
      setBatchIndex(3); // Start from batch 3 for future loads
      setLoading(false);
    };
    loadInitialBatch();
  }, [videoId, navigate]);

  const handleSelectVideo = async (video) => {
    if (isTransitioning || video.videoId === mainVideo?.videoId) return;
    
    setIsTransitioning(true);
    
    // Smooth transition effect
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setMainVideo(video);
    navigate(`/videos/${video.videoId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Load new content-based recommendations for the selected video
    try {
      const { newVideos: newRecommendations } = await fetchNextVideosBatch(0, 15, video);
      setVideos(prev => {
        // Keep some existing videos but prioritize new recommendations
        const existingIds = new Set(prev.map(v => v.videoId));
        const filteredRecommendations = newRecommendations.filter(v => !existingIds.has(v.videoId));
        
        // Combine: keep first 10 existing + add new recommendations
        return [...prev.slice(0, 10), ...filteredRecommendations];
      });
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleLoadMore = async () => {
    const nextIndex = batchIndex + 1;
    // Use current video context for better recommendations
    const { newVideos } = await fetchNextVideosBatch(nextIndex, 10, mainVideo);
    setVideos((prev) => [...prev, ...newVideos]);
    setBatchIndex(nextIndex);
  };

  if (loading || !mainVideo) {
    return (
      <div className="video-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  // Filter out the current video and get related videos
  const relatedVideos = videos.filter(v => v.videoId !== mainVideo.videoId);
  const relatedSidebar = relatedVideos.slice(0, 12);
  const relatedGrid = relatedVideos.slice(12);

  return (
    <div className="video-page">
      <div className="video-container">
        <div className="main-content">
          {/* Main Video Player */}
          <div className={`video-player ${isTransitioning ? 'transitioning' : ''}`}>
            <iframe
              src={mainVideo.embedUrl}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={mainVideo.title}
              key={mainVideo.videoId}
            />
            {isTransitioning && (
              <div className="video-transition-overlay">
                <div className="transition-spinner"></div>
              </div>
            )}
          </div>

          {/* Video Information */}
          <div className="video-info">
            <h1 className="video-title">{mainVideo.title}</h1>
            
            <div className="video-meta">
              <div className="channel-info">
                {mainVideo.channelLogo && (
                  <img
                    src={mainVideo.channelLogo}
                    alt={`${mainVideo.channelName} logo`}
                    className="channel-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="channel-details">
                  <h3 className="channel-name">{mainVideo.channelName}</h3>
                  <p className="upload-date">{formatTimeAgo(mainVideo.uploadDate)}</p>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="mobile-actions d-md-none">
                <button 
                  className="mobile-comment-v-btn"
                  onClick={() => setShowCommentPopup(true)}
                >
                  <i className="fa fa-comment"></i>
                  <span>{mainVideo.comments?.length || 0}</span>
                </button>
                <ShareButton video={mainVideo} />
              </div>
              
              {/* Desktop Share Button */}
              <div className="desktop-actions d-none d-md-flex">
                <ShareButton video={mainVideo} />
              </div>
            </div>
          </div>

          {/* Comments Section - Desktop Only */}
          <div className="comments-section d-none d-md-block">
            <h3 className="comments-title">
              {mainVideo.comments?.length || 0} Comments
            </h3>
            
            {mainVideo.comments && mainVideo.comments.length > 0 ? (
              <div className="comments-list">
                {mainVideo.comments.map((comment, index) => (
                  <div key={index} className="comment-v-item">
                    <div className="comment-v-avatar">
                      <div className="avatar-placeholder">
                        {comment.author.charAt(1).toUpperCase()}
                      </div>
                    </div>
                    <div className="comment-v-content">
                      <div className="comment-v-header">
                        <span className="comment-v-author">{comment.author}</span>
                        <span className="comment-v-time">{formatTimeAgo(comment.publishedAt)}</span>
                      </div>
                      <p className="comment-v-text">{comment.text}</p>
                      <div className="comment-v-actions">
                        <button className="comment-v-like">
                          <span>👍</span>
                          <span>{comment.likeCount}</span>
                        </button>
                        <button className="comment-v-reply">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        {/* Sidebar with Related Videos */}
        <div className="sidebar d-none d-md-block">
          <h3 className="sidebar-title">Recent Videos</h3>
          <div className="related-videos">
            {relatedSidebar.map((video) => (
              <div
                key={video.videoId}
                className="related-video-item"
                onClick={() => handleSelectVideo(video)}
              >
                <div className="related-thumbnail">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                  />
                  <div className="thumbnail-overlay">
                    <div className="play-icon">▶</div>
                  </div>
                </div>
                <div className="related-info">
                  <h4 className="related-title">{truncate(video.title, 80)}</h4>
                  <p className="related-channel">{video.channelName}</p>
                  <p className="related-date">{formatTimeAgo(video.uploadDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Related Videos - Full Width */}
      <div className="mobile-related-section d-md-none">
        <h3 className="mobile-related-title">Recent Videos</h3>
        <div className="mobile-related-videos">
          {relatedSidebar.map((video) => (
            <div
              key={video.videoId}
              className="mobile-related-item"
              onClick={() => handleSelectVideo(video)}
            >
              <div className="mobile-related-thumbnail">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                />
                <div className="thumbnail-overlay">
                  <div className="play-icon">▶</div>
                </div>
              </div>
              <div className="mobile-related-info">
                <h4 className="mobile-related-title-text">{truncate(video.title, 80)}</h4>
                <p className="mobile-related-channel">{video.channelName}</p>
                <p className="mobile-related-date">{formatTimeAgo(video.uploadDate)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* More Videos Grid */}
      {relatedGrid.length > 0 && (
        <div className="more-videos-section">
          <div className="section-header">
            <div className="v-section-title-wrapper">
              <h2 className="v-section-title-recommended">Recommended for you</h2>
              <div className="v-section-subtitle">Discover more amazing content</div>
            </div>
          </div>
          <div className="videos-grid">
            {relatedGrid.map((video) => (
              <div
                key={video.videoId}
                className="grid-video-item"
                onClick={() => handleSelectVideo(video)}
              >
                <div className="grid-thumbnail">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                  />
                  <div className="thumbnail-overlay">
                    <div className="play-icon">▶</div>
                  </div>
                </div>
                <div className="grid-info">
                  <h4 className="grid-title">{truncate(video.title, 60)}</h4>
                  <div className="grid-meta">
                    {video.channelLogo && (
                      <img
                        src={video.channelLogo}
                        alt={`${video.channelName} logo`}
                        className="grid-channel-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <p className="grid-channel">{video.channelName}</p>
                      <p className="grid-date">{formatTimeAgo(video.uploadDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load More Button */}
      <div className="load-more-section">
        <button className="load-more-btn" onClick={handleLoadMore}>
          Load More Videos
        </button>
      </div>
      
      {/* Mobile Comment Popup */}
      <CommentPopup 
        isOpen={showCommentPopup}
        onClose={() => setShowCommentPopup(false)}
        comments={mainVideo.comments || []}
        commentCount={mainVideo.comments?.length || 0}
      />
    </div>
  );
};

export default Video;