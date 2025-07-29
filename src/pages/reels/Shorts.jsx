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
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #fff;
          overscroll-behavior-y: contain;
          touch-action: pan-y;
        }

        #root {
          height: 100%;
        }

        .reel-feed-wrapper {
          height: 100%;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          background-color: #000;
          -webkit-overflow-scrolling: touch;
        }

        .reel-feed-wrapper::-webkit-scrollbar,
        .reel-feed-wrapper::-moz-scrollbar {
          display: none;
        }

        .reel-slide {
          scroll-snap-align: start;
          height: 100vh;
          width: 100vw;
          position: relative;
          overflow: hidden;
        }

        .reel-slide iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </>
  );
};

export default Shorts;
