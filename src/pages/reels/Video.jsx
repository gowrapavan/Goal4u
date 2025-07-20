import React, { useEffect, useState } from 'react';
import { fetchNextVideosBatch } from './videosFetcher'; // adjust if needed

const truncate = (str, max = 60) =>
  str.length > max ? str.slice(0, max).trim() + '…' : str;

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);

  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextVideosBatch();
      setVideos(newVideos);
      if (newVideos.length > 0) setMainVideo(newVideos[0]);
    };
    loadInitialBatch();
  }, []);

  const handleSelectVideo = (video) => {
    setMainVideo(video);
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
            <p>{mainVideo.channelName || 'Unknown Channel'}</p>
            <p>Uploaded on {mainVideo.uploadDate}</p>
          </div>

          {/* Comments */}
          <div className="video-comments">
            <h3>Comments</h3>
            <p>🚧 Comments fetching logic goes here...</p>
          </div>
        </div>

        {/* Related beside comments */}
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
                <h4>{truncate(video.title, 40)}</h4>
                <p>{video.channelName}</p>
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
              <p className="channel">{video.channelName}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="load-more">Load More</button>

      {/* CSS */}
      <style>{`
        .video-page {
          max-width: 1300px;
          margin: auto;
          padding: 20px;
          overflow-y: auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .top-section {
          display: flex;
          flex-direction: row;
          gap: 20px;
        }

        .main-column {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .youtube-video {
          aspect-ratio: 16 / 9;
          width: 100%;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .youtube-video iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-info h2 {
          margin-bottom: 6px;
          font-size: 22px;
        }

        .video-info p {
          margin: 2px 0;
          font-size: 14px;
          color: #666;
        }

        .video-comments {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          min-height: 100px;
        }

        .related-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .related-item {
          display: flex;
          gap: 10px;
          background: #fff;
          padding: 6px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          cursor: pointer;
        }

        .related-item:hover {
          background: #f0f0f0;
        }

        .thumb {
          width: 120px;
          height: 68px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info h4 {
          margin: 0;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .info p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #555;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .grid-item {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .grid-item img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 6px;
        }

        .grid-info {
          margin-top: 8px;
        }

        .grid-info .title {
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .grid-info .channel {
          font-size: 12px;
          color: #555;
        }

        .load-more {
          align-self: center;
          margin-top: 20px;
          padding: 10px 16px;
          font-size: 14px;
          border: none;
          background: #0073ff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .load-more:hover {
          background: #005ed1;
        }

        /* Custom Scrollbar */
        .video-page::-webkit-scrollbar {
          width: 10px;
        }

        .video-page::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
          border-radius: 10px;
        }

        .video-page::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Video;
