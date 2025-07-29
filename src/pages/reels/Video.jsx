import React, { useEffect, useState } from 'react';
import { fetchNextVideosBatch } from './videosFetcher'; // Adjust path if needed
import './Video.css';

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

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  const [batchIndex, setBatchIndex] = useState(0);

  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextVideosBatch(batchIndex);
      setVideos(newVideos);
      if (newVideos.length > 0) setMainVideo(newVideos[0]);
    };
    loadInitialBatch();
  }, [batchIndex]);

  const handleSelectVideo = (video) => {
    setMainVideo(video);
  };

  const handleLoadMore = async () => {
    const nextIndex = batchIndex + 1;
    const { newVideos } = await fetchNextVideosBatch(nextIndex);
    setVideos((prev) => [...prev, ...newVideos]);
    setBatchIndex(nextIndex);
  };

  if (!mainVideo) return <p>Loading...</p>;

  const relatedVideos = videos.filter((v) => v.id !== mainVideo.id);
  const relatedAboveFold = relatedVideos.slice(0, 6);
  const relatedGrid = relatedVideos.slice(6);

  return (
    <div className="video-page">
      <div className="top-section">
        <div className="main-column">
          {/* Main Video */}
          <div className="youtube-video">
            <iframe
              src={mainVideo.src}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Main YouTube Video"
            />
          </div>

          {/* Info */}
          <div className="video-info">
            <h2>{mainVideo.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mainVideo.channelLogo && (
                <img
                  src={mainVideo.channelLogo}
                  alt={`Logo of ${mainVideo.channelName || 'Unknown Channel'}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/img/6.svg';
                  }}
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              )}
              <p>{mainVideo.channelName || 'Unknown Channel'}</p>
              <span style={{ color: '#888', marginLeft: 'auto' }}>
                {formatDate(mainVideo.uploadDate)}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="video-comments">
            <h3>Comments</h3>
            <p>🚧 Comments fetching logic goes here...</p>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="related-side">
          {relatedAboveFold.map((video) => (
            <div
              key={video.id}
              className="related-item"
              onClick={() => handleSelectVideo(video)}
            >
              <div className="thumb">
                <img
                  src={
                    video.thumbnail ||
                    `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                  }
                  alt={video.title}
                />
              </div>
              <div className="info">
                <h4>{truncate(video.title, 60)}</h4>

                {/* Upload date */}
                <p className="upload-date">{formatDate(video.uploadDate)}</p>

                {/* Channel info (logo + name) */}
                <div className="channel-meta">
                  {video.channelLogo && (
                    <img
                      src={video.channelLogo}
                      alt={`Logo of ${video.channelName || 'Unknown Channel'}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }} style={{ width: '24px', height: '24px', borderRadius: '50%' }}

                      className="related-channel-logo"
                    />
                  )}
                  <p>{video.channelName || 'Unknown Channel'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid Section */}
      <div className="bottom-grid">
        {relatedGrid.map((video) => (
          <div
            key={video.id}
            className="grid-item"
            onClick={() => handleSelectVideo(video)}
          >
            <img
              src={
                video.thumbnail ||
                `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
              }
              alt={video.title}
            />
          <div className="grid-info">
            <p className="title">{truncate(video.title)}</p>

            <div className="channel-meta">
              {video.channelLogo && (
                <img
                  src={video.channelLogo}
                  alt={`Logo of ${video.channelName || 'Unknown Channel'}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  className="channel-logo"
                />
              )}
              <span className="channel-name">{video.channelName || 'Unknown Channel'}</span>
              <span className="upload-date">{formatDate(video.uploadDate)}</span>
            </div>
          </div>
         </div>
        ))}
      </div>

      {/* Load More */}
      <div className="load-more-wrapper">
        <button className="load-more" onClick={handleLoadMore}>
          Load More
        </button>
      </div>
    </div>
  );
};

export default Video;
