import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch } from './reelsFetcher';

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextReelsBatch();
      setReelsData(newVideos);
      setLoading(false);
    };
    loadInitialBatch();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.scrollBehavior = 'smooth';
    }
  }, [loading]);

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <>
      <div className="reel-feed-wrapper" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={`${reel.id}-${i}`} className="reel-slide" data-index={i}>
            <iframe
              src={reel.src}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              playsInline
              title={`reel-${reel.id}`}
            />
          </div>
        ))}
      </div>

      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          overflow: hidden;
        }

        .reel-feed-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          background-color: #000;
        }

        .reel-feed-wrapper::-webkit-scrollbar {
          display: none;
        }

        .reel-slide {
          scroll-snap-align: start;
          height: calc(100vh - 24px);
          width: 100vw;
          position: relative;
          overflow: hidden;
        }

        .reel-slide iframe {
          width: 100%;
          height: 100%;
          border: none;
          object-fit: cover;
        }
      `}</style>
    </>
  );
};

export default Shorts;
