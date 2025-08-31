import React, { useEffect, useState } from "react";

// --- JSON Sources ---
const jsonFiles = [
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/doublexx.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/koora10.json",
];

const StreamCard = ({ stream, onWatch }) => {
  return (
    <div className="stream-card">
      <div className="card-header">
        {stream.Logo && (
          <img src={stream.Logo} alt="logo" className="slogo" />
        )}
        {(stream.home_team && stream.away_team) && (
          <span className="card-title">
            {stream.home_team} <span className="vs">vs</span> {stream.away_team}
          </span>
        )}
      </div>

      {stream.time && (
        <div className="match-info">
          <p className="time">⏰ {stream.time}</p>
        </div>
      )}

      <button onClick={() => onWatch(stream)} className="watch-btn">
        ▶ Watch Now
      </button>
    </div>
  );
};

const MultipleTV = () => {
  const [jsonStreams, setJsonStreams] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeStream, setActiveStream] = useState(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const results = await Promise.all(
          jsonFiles.map((url) =>
            fetch(url).then((res) => res.json()).catch(() => [])
          )
        );
        const merged = results.flat();
        setJsonStreams(merged);
      } catch (e) {
        console.error("Error fetching JSON streams", e);
      }
    };
    fetchStreams();
  }, []);

  return (
    <div className="multi-tv-wrapper">
      {jsonStreams.slice(0, visibleCount).map((stream, idx) => (
        <StreamCard key={idx} stream={stream} onWatch={setActiveStream} />
      ))}

      {visibleCount < jsonStreams.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 6)}
          className="load-more-btn"
        >
          ⬇ Load More
        </button>
      )}

      {activeStream && (
        <div className="overlay" onClick={() => setActiveStream(null)}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="overlay-title">
              {activeStream.home_team} vs {activeStream.away_team}
            </h2>
            <iframe
              src={activeStream.url1 || activeStream.url}
              allowFullScreen
              title={activeStream.home_team + " vs " + activeStream.away_team}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin"
              className="overlay-iframe"
            ></iframe>
            <button onClick={() => setActiveStream(null)} className="close-btn">
              ✖ Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .multi-tv-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          padding: 20px;
          background: radial-gradient(circle at top, #0a0a0a, #000);
          min-height: 100vh;
        }
        .stream-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255, 0, 150, 0.4);
          backdrop-filter: blur(10px);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .stream-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 0 20px rgba(255, 0, 150, 0.6);
        }
        .slogo {
          width: 50px !important;
          height: 50px !important;
          border-radius: 8px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .card-title {
          font-size: 1rem;
          font-weight: bold;
          color: #ff0099;
        }
        .vs {
          color: #ff6600;
          margin: 0 3px;
        }
        .watch-btn {
          margin-top: auto;
          background: linear-gradient(90deg, #ff0099, #ff6600);
          border: none;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          color: white;
          font-weight: bold;
          font-size: 0.95rem;
        }
        .watch-btn:hover {
          opacity: 0.9;
        }
        .load-more-btn {
          grid-column: 1 / -1;
          justify-self: center;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid #ff0099;
          padding: 12px 24px;
          color: #ff0099;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 20px;
          font-weight: bold;
        }
        .match-info {
          font-size: 14px;
          text-align: center;
          color: #ddd;
          margin: 8px 0;
        }
        .time {
          color: #ffde59;
          font-weight: 600;
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
          backdrop-filter: blur(8px);
          padding: 10px;
        }
        .overlay-content {
          background: rgba(20, 20, 20, 0.95);
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 0 25px rgba(255, 0, 150, 0.6);
          max-width: 95%;
          width: 850px;
          text-align: center;
        }
        .overlay-title {
          color: #ff0099;
          margin-bottom: 12px;
          font-size: 1.2rem;
          font-weight: bold;
        }
        .overlay-iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border: none;
          background: black;
          border-radius: 12px;
        }
        .close-btn {
          margin-top: 14px;
          background: #ff0099;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        }
        /* --- Mobile Responsive --- */
        @media (max-width: 768px) {
          .multi-tv-wrapper {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            padding: 15px;
          }
          .logo {
            width: 40px !important;
            height: 40px !important;
          }
        }
        @media (max-width: 500px) {
          .multi-tv-wrapper {
            grid-template-columns: 1fr;
          }
          .overlay-content {
            width: 100%;
            border-radius: 10px;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default MultipleTV;
