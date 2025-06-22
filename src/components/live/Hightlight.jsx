// components/Youtube.jsx
import React, { useEffect, useState } from 'react';

const Youtube = ({ query }) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function fetchYt() {
      const key = import.meta.env.VITE_YOUTUBE_API_KEY;
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(query)}&key=${key}`;
      try {
        const resp = await fetch(url);
        const { items } = await resp.json();
        setVideos(items || []);
      } catch (e) {
        console.error('YT API error:', e);
      }
    }
    if (query) fetchYt();
  }, [query]);

  return (
    <div className="row no-line-height">
      <div className="col-md-12"><h3 className="clear-title">Match Videos</h3></div>
      {videos.map((item, i) => {
        const vid = item.id.videoId;
        const title = item.snippet.title;
        return (
          <div className="col-lg-6 col-xl-4" key={vid}>
            <div className="panel-box">
              <div className="titles no-margin"><h4><a href={`https://youtu.be/${vid}`} target="_blank" rel="noopener noreferrer">{title}</a></h4></div>
              <iframe className="video" src={`https://www.youtube.com/embed/${vid}`} frameBorder="0" allow="encrypted-media" allowFullScreen></iframe>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Youtube;
