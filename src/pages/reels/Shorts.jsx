import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch } from './reelsFetcher';

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextReelsBatch();
      setReelsData(newVideos);
      setLoading(false);
    };
    loadInitialBatch();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const container = containerRef.current;

      const handleScroll = () => {
        const slides = container.querySelectorAll('.reel-slide');
        slides.forEach((slide) => {
          const rect = slide.getBoundingClientRect();
          const iframe = slide.querySelector('iframe');

          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else {
            iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        });
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [loading]);

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <>
      <div className="shorts-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
      </div>

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
          height: 40px;
          z-index: 10;
          display: flex;
          align-items: center;
          padding-left: 10px;
          background: rgba(0, 0, 0, 0.6);
        }

        .back-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
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
          height: 100vh;
          width: 100vw;
          position: relative;
          overflow: hidden;
        }

        .reel-slide iframe {
          position: absolute;
          top: 0;
          left: 0;
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
          z-index: 2;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.15);
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
