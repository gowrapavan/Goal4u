import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch } from './reelsFetcher';

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const containerRef = useRef(null);
  const playerRefs = useRef({});

  // Handle mobile detection on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsMuted(!mobile); // unmute if mobile
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadInitialBatch = async () => {
    setLoading(true);
    const { newVideos, hasMore } = await fetchNextReelsBatch();
    setReelsData(newVideos);
    setHasMore(hasMore);
    setLoading(false);
  };

  const loadMoreBatch = async () => {
    if (!hasMore) return;
    const { newVideos, hasMore: moreLeft } = await fetchNextReelsBatch();
    setReelsData((prev) => [...prev, ...newVideos]);
    setHasMore(moreLeft);
  };

  useEffect(() => {
    loadInitialBatch();
  }, []);

  // Observe current slide
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setCurrentReel(index);
            if (index >= reelsData.length - 5 && hasMore) {
              loadMoreBatch();
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.75 }
    );

    const slides = document.querySelectorAll('.reel-slide');
    slides.forEach((slide) => observer.observe(slide));

    return () => slides.forEach((slide) => observer.unobserve(slide));
  }, [reelsData, hasMore]);

  // Play current reel & pause others
  const controlVideoPlayback = () => {
    reelsData.forEach((reel) => {
      const iframe = playerRefs.current[reel.id];
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    });

    const current = reelsData[currentReel];
    const currentIframe = current && playerRefs.current[current.id];
    if (document.visibilityState === 'visible' && currentIframe?.contentWindow) {
      currentIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      currentIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: isMuted ? 'mute' : 'unMute', args: [] }),
        '*'
      );
    }
  };

  useEffect(() => {
    const delay = setTimeout(controlVideoPlayback, 100);
    return () => clearTimeout(delay);
  }, [currentReel, isMuted]);

  // Handle tab visibility change (pause/resume)
  useEffect(() => {
    const onVisibilityChange = () => {
      const reel = reelsData[currentReel];
      const iframe = reel && playerRefs.current[reel.id];
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: document.visibilityState === 'visible' ? 'playVideo' : 'pauseVideo',
            args: [],
          }),
          '*'
        );
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [currentReel, reelsData]);

  const scrollToReel = (index) => {
    const slide = document.querySelector(`[data-index="${index}"]`);
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  if (loading) return <LoadingSpinner message="Loading football shorts..." />;

  return (
    <>
      <div className="reel-feed-wrapper" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={reel.id} className="reel-slide" data-index={i}>
            <div className="reel-wrapper">
              <div className="reel-content">
                <iframe
                  ref={(el) => {
                    if (reel.type === 'youtube') playerRefs.current[reel.id] = el;
                  }}
                  src={reel.src}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`reel-${reel.id}`}
                />
                <div className="channel-overlay">
                  {reel.logo && <img src={reel.logo} alt="logo" />}
                  <span>{reel.channelName}</span>
                </div>

                {!isMobile && (
                  <button className="mute-toggle-btn" onClick={toggleMute}>
                    {isMuted ? '🔊' : '🔇'}
                  </button>
                )}
              </div>

              <div className="nav-buttons desktop-only">
                <button onClick={() => scrollToReel(currentReel - 1)}>↑</button>
                <button onClick={() => scrollToReel(currentReel + 1)}>↓</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .reel-feed-wrapper {
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          background-color: #fff;
        }

        .reel-feed-wrapper::-webkit-scrollbar {
          display: none;
        }

        .reel-slide {
          scroll-snap-align: start;
          height: 90vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .reel-wrapper {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .reel-content {
          width: 344px;
          height: 611px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 18px 24px rgba(0, 0, 0, 0.4);
          background: black;
        }

        .reel-content iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .channel-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: rgba(0, 0, 0, 0.4);
          padding: 5px 10px;
          border-radius: 20px;
          color: white;
          font-size: 14px;
        }

        .channel-overlay img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .mute-toggle-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 18px;
          cursor: pointer;
        }

        .nav-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nav-buttons button {
          background: #e50914;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 20px;
          color: white;
          cursor: pointer;
        }

        .desktop-only {
          display: flex;
        }

        @media (max-width: 768px) {
          .reel-content {
            width: 100vw;
            height: 97vh;
            border-radius: 0;
            padding-top: 50px;
            box-shadow: none;
          }

          .nav-buttons.desktop-only {
            display: none;
          }

          .channel-overlay {
            top: 6%;
            left: 10px;
            font-size: 15px;
          }

          .mute-toggle-btn {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Shorts;
