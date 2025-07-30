import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch, maybePrefetchMore } from './reelsFetcher';

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Load first batch of videos
  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextReelsBatch();
      setReelsData(prev => [...prev, ...newVideos]); // Append instead of replace
      setLoading(false);
    };
    loadInitialBatch();
  }, []);

  // Scroll autoplay behavior
  useEffect(() => {
    if (!loading && containerRef.current) {
      const container = containerRef.current;

      const handleScroll = () => {
        const slides = container.querySelectorAll('.reel-slide');
        let activeIndex = -1;

        slides.forEach((slide, idx) => {
          const rect = slide.getBoundingClientRect();
          const iframe = slide.querySelector('iframe');

          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            activeIndex = idx;
            iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else {
            iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        });

        if (activeIndex !== -1) {
          setCurrentIndex(activeIndex);
        }
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [loading]);

  // Optional: prefetch logic
  useEffect(() => {
    maybePrefetchMore(currentIndex);
  }, [currentIndex]);

  // 🚀 Auto-load more videos when last reel is visible
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      if (currentIndex === reelsData.length - 1) {
        const { newVideos } = await fetchNextReelsBatch();
        setReelsData(prev => [...prev, ...newVideos]);
      }
    };
    loadMoreIfNeeded();
  }, [currentIndex]);

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <>
      <div className="shorts-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="arrow">←</span>
          <span className="back-text">Back To Home</span>
        </button>
      </div>

      <div className="reel-feed-wrapper" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={`${reel.id}-${i}`} className="reel-slide" data-index={i}>
            <iframe
              src={`${reel.src}?enablejsapi=1`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              playsInline
              title={`reel-${reel.id}`}
            />
            <div className="reel-actions">
              <button className="action-btn">❤️</button>
              <button className="action-btn">🔗</button>
              {reel.channelLogo && (
                <img
                  src={reel.channelLogo}
                  alt={reel.channelName}
                  className="channel-logo"
                />
              )}
            </div>
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
        .shorts-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 48px;
          z-index: 10;
          display: flex;
          align-items: center;
          padding: 0 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-btn {
          display: flex;
          align-items: center;
          color: white;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          transition: background 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .back-btn .arrow {
          font-size: 20px;
          line-height: 1;
        }

        .back-btn .back-text {
          font-size: 9px;
          line-height: 1;
          padding-top: 5px;
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
          height: calc(100vh - 12px);
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

        .reel-actions {
          position: absolute;
          right: 10px;
          bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
        }

        .action-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          font-size: 22px;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
        }

        .channel-logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: contain;
          background: white;
        }
      `}</style>
    </>
  );
};

export default Shorts;
