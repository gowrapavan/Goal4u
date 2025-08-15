import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNextVideosBatch } from './videosFetcher';
import './YVideo.css';

const truncate = (str, max = 60) =>
  str.length > max ? str.slice(0, max).trim() + '…' : str;

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

const YVideo = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchIndex, setBatchIndex] = useState(0);

  useEffect(() => {
    const loadInitialVideos = async () => {
      setLoading(true);
      try {
        const batch1 = await fetchNextVideosBatch(0, 12, null);
        const batch2 = await fetchNextVideosBatch(1, 12, null);
        const batch3 = await fetchNextVideosBatch(2, 12, null);

        const allVideos = [...batch1.newVideos, ...batch2.newVideos, ...batch3.newVideos];
        setVideos(allVideos);
        setBatchIndex(3);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialVideos();
  }, []);

  const handleVideoClick = (video) => {
    navigate(`/videos/${video.videoId}`);
  };

  const handleLoadMore = async () => {
    try {
      const { newVideos } = await fetchNextVideosBatch(batchIndex, 12, null);
      setVideos(prev => [...prev, ...newVideos]);
      setBatchIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more videos:', error);
    }
  };

  if (loading) {
    return (
      <div className="YVideo-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="YVideo-page">

      {/* YouTube Channel Promo Card (No iframe) */}
      <div className="yt-promo-card">
<picture>
  {/* Desktop logo */}
  <source
    media="(min-width: 768px)"
    srcSet="https://yt3.googleusercontent.com/rpqVuGe3g57-1c84Wy_Y8grDvnJAxE4NCtmf9mewlcdU5n1oflv404BAaS5_5p1FW2cLj7EqpA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj"
  />
  {/* Mobile logo */}
  <img
    src="https://yt3.googleusercontent.com/DzaeBGqaW3UehPRF2lvbqBjXX4BtdEj0zMuAzLHTXxgliUp46j8T7sT7qJN-sMQBwmP91IZRzw=s160-c-k-c0x00ffffff-no-rj"
    alt="Goal4U TV Channel Logo"
    className="yt-promo-logo"
  />
</picture>

        <h2 className="yt-promo-name">Goal4U TV</h2>
        <p className="yt-promo-text">
          Dive into football highlights, exclusive insights, and more—subscribe now!
        </p>
        <a
          href="https://www.youtube.com/@goal4u-tv"
          target="_blank"
          rel="noopener noreferrer"
          className="yt-promo-btn"
        >
          ▶ Subscribe on YouTube
        </a>
      </div>

      {/* Video Feed */}
      <div className="videos-feed">
        {videos.map(video => (
          <div
            key={video.videoId}
            className="feed-video-item"
            onClick={() => handleVideoClick(video)}
          >
            <div className="feed-thumbnail">
              <img src={video.thumbnail} alt={video.title} loading="lazy" />
              <div className="thumbnail-overlay">
                <div className="play-icon">▶</div>
              </div>
            </div>
            <div className="feed-info">
              <h3 className="feed-title">{truncate(video.title, 80)}</h3>
              <div className="feed-meta">
                {video.channelLogo && (
                  <img
                    src={video.channelLogo}
                    alt={`${video.channelName} logo`}
                    className="feed-channel-avatar"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="feed-channel-info">
                  <p className="feed-channel">{video.channelName}</p>
                  <p className="feed-date">{formatTimeAgo(video.uploadDate)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="load-more-section">
        <button className="load-more-btn" onClick={handleLoadMore}>
          Load More Videos
        </button>
      </div>
    </div>
  );
};

export default YVideo;
