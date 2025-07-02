import React, { useEffect, useState } from 'react';

const Youtube = ({ query }) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function fetchYt() {
      const key = import.meta.env.VITE_YOUTUBE_API_KEY;
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${key}`;
      try {
        const resp = await fetch(url);
        const { items } = await resp.json();

        const filtered = items.filter(
          (item) =>
            item?.id?.videoId &&
            item?.snippet?.channelTitle &&
            !item.snippet.channelTitle.toLowerCase().includes('fifa')
        );

        setVideos(filtered.slice(0, 3));
      } catch (e) {
        console.error('YT API error:', e);
      }
    }
    if (query) fetchYt();
  }, [query]);

  const trimTitle = (title) =>
    title.length > 75 ? title.slice(0, 75) + '...' : title;

  return (
    <div className="row no-line-height">
      <div className="col-md-12">
        <h3 className="clear-title">Match Videos</h3>
      </div>
      {videos.length === 0 && (
        <div className="col-12 text-muted">
          No videos found — try watching on YouTube directly.
        </div>
      )}
      {videos.map((item) => {
        const vid = item.id.videoId;
        const title = trimTitle(item.snippet.title);
        const embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0`;

        return (
          <div className="col-lg-6 col-xl-4" key={vid}>
            <div className="panel-box">
              <div className="titles no-margin">
                <h4
                  style={{
                    minHeight: '48px',
                    maxHeight: '71080px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '1rem',
                    lineHeight: '1.5rem',
                  }}
                >
                  <a
                    href={`https://youtu.be/${vid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {title}
                  </a>
                </h4>
              </div>
              <div className="ratio ratio-16x9">
                <iframe
                  className="video"
                  src={embedUrl}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={title}
                ></iframe>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Youtube;
